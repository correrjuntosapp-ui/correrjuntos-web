import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================================
// REVENUCAT WEBHOOK — Edge Function
// Receives events from RevenueCat server-to-server webhooks
// Updates Supabase es_premium/fecha_premium based on events
//
// Setup in RevenueCat Dashboard:
// 1. Go to Project → Integrations → Webhooks
// 2. URL: https://waihiwdbtcbdazmaxdor.supabase.co/functions/v1/revenucat-webhook
// 3. Authorization header: Bearer <REVENUCAT_WEBHOOK_SECRET>
// ============================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// [18 jul 2026] Sella el resultado de procesamiento de un evento en
// revenuecat_webhook_events (idempotencia/auditoría). Estados:
// received | processing | applied | ignored | stale | failed |
// reconciliation_required. Tolerante: si la tabla aún no existe (migración
// pendiente), no rompe el webhook.
// deno-lint-ignore no-explicit-any
async function markEvent(supabase: any, eventId: string, result: string) {
  if (!eventId) return
  try {
    await supabase
      .from('revenuecat_webhook_events')
      .update({ processing_result: result, processed_at: new Date().toISOString() })
      .eq('event_id', eventId)
  } catch (_e) { /* tabla ausente — tolerado */ }
}

// [18 jul 2026] Clave de FLUJO DE COMPRA para el guard de orden temporal.
// Comparar event_timestamp_ms SOLO dentro del mismo stream: un evento de un
// plan individual no debe descartar uno de Premium, ni el anual a uno mensual,
// ni un TRANSFER bloquear una renovación posterior. Prioridad:
//   1. original_transaction_id
//   2. entitlement + store + product_id
//   3. 'promo:' + entitlement (granted entitlements)
//   4. 'transfer:' + clave estable de transferred_from/transferred_to
//   5. fallback: user + product (o user + tipo) — documentado
// deno-lint-ignore no-explicit-any
function computeStreamKey(event: any, userId: string): string {
  if (event.type === 'TRANSFER') {
    const from = (Array.isArray(event.transferred_from) ? event.transferred_from : []).slice().sort().join('|')
    const to = (Array.isArray(event.transferred_to) ? event.transferred_to : []).slice().sort().join('|')
    return `transfer:${from}=>${to}`
  }
  if (event.original_transaction_id) {
    return `otx:${event.original_transaction_id}`
  }
  const ent = Array.isArray(event.entitlement_ids) && event.entitlement_ids.length
    ? event.entitlement_ids.slice().sort().join('+')
    : (event.entitlement_id || 'unknown_entitlement')
  if (event.period_type === 'PROMOTIONAL' || event.store === 'PROMOTIONAL') {
    return `promo:${userId}:${ent}`
  }
  const product = event.product_id || event.product_identifier || 'unknown_product'
  const store = event.store || 'unknown_store'
  return `sub:${userId}:${ent}:${store}:${product}`
}

// [18 jul 2026] RECONCILIACIÓN server-side con RevenueCat (API REST) para
// eventos ambiguos (TRANSFER, reembolso CUSTOMER_SUPPORT, REFUND_REVERSED):
// el estado definitivo del espejo NO se deriva solo del webhook, sino del
// entitlement ACTUAL del Customer. Secret SOLO en env de la Edge Function
// (REVENUCAT_SECRET_API_KEY) — nunca en el cliente, nunca en logs.
// Devuelve null si el servicio no está configurado o falla (el llamante deja
// reconciliation_required para retry controlado).
// deno-lint-ignore no-explicit-any
async function fetchRcEntitlementState(appUserId: string): Promise<
  | { active: boolean; expiresAt: string | null; productId: string | null; store: string | null; promotional: boolean }
  | null
> {
  const apiKey = Deno.env.get('REVENUCAT_SECRET_API_KEY')
  if (!apiKey || apiKey.trim().length === 0) return null
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000) // timeout 8s
    const res = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`,
      { headers: { Authorization: `Bearer ${apiKey}` }, signal: controller.signal },
    )
    clearTimeout(timer)
    if (!res.ok) {
      // 401/403 (credencial), 404 (customer), 429 (rate), 5xx — sin cuerpo en logs.
      console.warn(`RC reconcile: HTTP ${res.status} for user ${appUserId.slice(0, 8)}…`)
      return null
    }
    const data = await res.json()
    const ent = data?.subscriber?.entitlements?.['Correr Juntos Pro']
    if (!ent) {
      return { active: false, expiresAt: null, productId: null, store: null, promotional: false }
    }
    const expiresAt: string | null = ent.expires_date ?? null
    const active = expiresAt === null || Date.parse(expiresAt) > Date.now()
    const productId: string | null = ent.product_identifier ?? null
    const promotional = typeof productId === 'string' && productId.startsWith('rc_promo')
    return { active, expiresAt, productId, store: promotional ? 'PROMOTIONAL' : null, promotional }
  } catch (e) {
    console.warn('RC reconcile: request failed:', (e as Error)?.name || 'error')
    return null
  }
}

// Aplica al espejo Supabase el estado ACTUAL devuelto por RevenueCat.
// deno-lint-ignore no-explicit-any
async function applyReconciledState(supabase: any, targetUserId: string,
  state: { active: boolean; expiresAt: string | null }) {
  const updates: Record<string, unknown> = { es_premium: state.active }
  if (state.expiresAt) updates.premium_until = state.expiresAt
  const { error } = await supabase.from('profiles').update(updates).eq('id', targetUserId)
  if (error) console.warn(`RC reconcile: mirror update failed for ${targetUserId.slice(0, 8)}…:`, error.message)
  else console.log(`RC reconcile: mirror ${state.active ? 'ACTIVE' : 'inactive'} for ${targetUserId.slice(0, 8)}… until ${state.expiresAt ?? 'n/a'}`)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // [18 jul 2026] Auth FAIL-CLOSED. Antes: `if (secret && header!==...)` →
    // si el secreto NO estaba definido, se ACEPTABA cualquier petición (webhook
    // sin autenticar). Ahora, sin secreto no se procesa nada.
    const authHeader = req.headers.get('authorization')
    const webhookSecret = Deno.env.get('REVENUCAT_WEBHOOK_SECRET')

    // 1 · Secreto ausente o vacío → 503 (config), no se procesa ningún evento.
    if (!webhookSecret || webhookSecret.trim().length === 0) {
      console.error('RevenueCat webhook: REVENUCAT_WEBHOOK_SECRET not configured — rejecting (fail-closed)')
      return new Response(
        JSON.stringify({ error: 'Webhook not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 503 }
      )
    }

    // 2 · Header ausente o incorrecto → 401. Comparación con el valor exacto.
    if (authHeader !== `Bearer ${webhookSecret}`) {
      console.error('RevenueCat webhook: unauthorized call (bad or missing Authorization header)')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const body = await req.json()
    const event = body.event

    if (!event) {
      return new Response(
        JSON.stringify({ error: 'No event in body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('RevenueCat event:', event.type, 'app_user_id:', event.app_user_id)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = (Deno.env.get('SERVICE_ROLE_KEY_NEW') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // The app_user_id should be the Supabase user UUID
    // (set via Purchases.logIn(userId) in the mobile app)
    const userId = event.app_user_id

    if (!userId || userId.startsWith('$RCAnonymousID')) {
      console.log('Anonymous user or no user ID — skipping sync')
      return new Response(
        JSON.stringify({ ok: true, skipped: true, reason: 'anonymous_user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ────────────────────────────────────────────────────────
    // [18 jul 2026] IDEMPOTENCIA + ORDEN TEMPORAL POR STREAM.
    //  · event.id se procesa UNA sola vez (PK; retry con el mismo id → 200
    //    idempotent_duplicate sin repetir efectos). Se registra 'received' y
    //    solo se marca el resultado final al COMPLETAR el efecto (un fallo
    //    queda 'received'/'failed' → reintentable de forma controlada).
    //  · event_timestamp_ms manda (nunca received_at), comparado SOLO dentro
    //    del MISMO stream_key: un evento de plan individual no descarta uno de
    //    Premium; anual y mensual no se pisan; TRANSFER usa stream propio.
    //  · Tolerante a migración pendiente: si la tabla no existe, se procesa
    //    igualmente (sin dedupe) y se avisa en logs.
    // ────────────────────────────────────────────────────────
    const eventId: string = String(event.id || '')
    const eventTimestampMs: number = Number(event.event_timestamp_ms) || 0
    const streamKey: string = computeStreamKey(event, userId)
    if (eventId) {
      const { error: insErr } = await supabase
        .from('revenuecat_webhook_events')
        .insert({
          event_id: eventId,
          event_type: event.type,
          event_timestamp_ms: eventTimestampMs,
          stream_key: streamKey,
          environment: event.environment || null,
          processing_result: 'received',
        })
      if (insErr) {
        if ((insErr as { code?: string }).code === '23505') {
          console.log(`Idempotent duplicate event ${eventId} — no effects re-applied`)
          return new Response(
            JSON.stringify({ ok: true, skipped: true, reason: 'idempotent_duplicate' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        console.warn('webhook_events insert skipped (table pending?):', insErr.message)
      } else if (eventTimestampMs > 0) {
        // Guard de orden: SOLO dentro del mismo stream de compra.
        const { data: newer } = await supabase
          .from('revenuecat_webhook_events')
          .select('event_id')
          .eq('stream_key', streamKey)
          .gt('event_timestamp_ms', eventTimestampMs)
          .in('processing_result', ['applied', 'reconciliation_required'])
          .limit(1)
        if (newer && newer.length > 0) {
          console.log(`Stale event ${eventId} (${event.type}) — newer state in same stream; ignoring`)
          await markEvent(supabase, eventId, 'stale')
          return new Response(
            JSON.stringify({ ok: true, skipped: true, reason: 'stale' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    // [18 jul 2026] Contrato REAL de eventos RevenueCat:
    //  · Grant/refresh del espejo: INITIAL_PURCHASE, RENEWAL, PRODUCT_CHANGE
    //    (si el cambio es diferido, el producto efectivo llega en el RENEWAL),
    //    UNCANCELLATION, SUBSCRIPTION_EXTENDED (actualiza vencimiento) y
    //    TEMPORARY_ENTITLEMENT_GRANT (acceso temporal concedido por RC ante
    //    incidencias de tienda — expira solo por su expiration_at; NUNCA se
    //    convierte en grant manual permanente).
    //  · Revoca SOLO EXPIRATION. Los grants manuales viven en
    //    premium_manual_grants y este webhook JAMÁS los toca.
    //  · BILLING_ISSUE NO revoca (grace period: el acceso sigue hasta que
    //    llegue EXPIRATION; RENEWAL posterior limpia la señal).
    //  · NO existe un evento genérico 'REFUND': un reembolso llega como
    //    CANCELLATION con cancel_reason=CUSTOMER_SUPPORT (y la pérdida real
    //    de acceso, con su EXPIRATION). REFUND_REVERSED registra la reversión.
    //  · TRANSFER mueve la compra entre App User IDs.
    const grantPremiumEvents = [
      'INITIAL_PURCHASE',
      'RENEWAL',
      'PRODUCT_CHANGE',           // Upgrade/downgrade
      'UNCANCELLATION',           // Re-subscribed after cancel
      'SUBSCRIPTION_EXTENDED',    // Extensión del vencimiento — mantiene acceso
      'TEMPORARY_ENTITLEMENT_GRANT', // Acceso temporal RC (no manual, no permanente)
    ]

    // Events that revoke the RevenueCat mirror (manual grants untouched)
    const revokePremiumEvents = [
      'EXPIRATION',
    ]

    // Cancelación: conserva acceso hasta expiración; CUSTOMER_SUPPORT = refund
    const cancellationEvents = [
      'CANCELLATION',
    ]

    if (grantPremiumEvents.includes(event.type)) {
      // Grant premium
      const expiresDate = event.expiration_at_ms
        ? new Date(event.expiration_at_ms).toISOString()
        : null

      // Trial detection — RC sends period_type = "TRIAL" | "INTRO" | "NORMAL"
      // Powers trial-reminder-cron edge function.
      const periodType: string = event.period_type || 'NORMAL'
      const isTrial = periodType === 'TRIAL'
      const purchasedDate = event.purchased_at_ms
        ? new Date(event.purchased_at_ms).toISOString()
        : new Date().toISOString()

      const updates: Record<string, unknown> = {
        es_premium: true,
        fecha_premium: expiresDate,
        premium_until: expiresDate,
        subscription_period: periodType,
      }

      // Stamp trial fields only when the user enters a trial for the first time
      // (INITIAL_PURCHASE with period_type=TRIAL). RENEWAL keeps existing values.
      if (isTrial && event.type === 'INITIAL_PURCHASE') {
        updates.trial_started_at = purchasedDate
        updates.trial_ends_at = expiresDate
        updates.trial_used = true
        // Reset reminder stamps in case this is a re-trial after a previous one
        updates.trial_reminder_d12_at = null
        updates.trial_reminder_d14_at = null
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)

      if (error) {
        console.error('Error granting premium:', error.message)
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      console.log(`Premium GRANTED for ${userId} (${periodType}) until ${expiresDate}`)

      // [11 may 2026] Close trial_starts lifecycle row when trial converts to paid.
      // INITIAL_PURCHASE with TRIAL is recorded by iap.ts client-side.
      // The first RENEWAL after that with period_type=NORMAL = Apple/Google
      // charged the first paid period → trial successfully converted.
      // PRODUCT_CHANGE (upgrade) also counts as conversion.
      if (
        !isTrial &&
        (event.type === 'RENEWAL' || event.type === 'PRODUCT_CHANGE' || event.type === 'UNCANCELLATION')
      ) {
        try {
          const { data: updated, error: tsErr } = await supabase
            .from('trial_starts')
            .update({ status: 'paid', completed_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('status', 'trial_active')
            .select('id')
          if (tsErr) {
            console.warn(`trial_starts close (paid) failed for ${userId}:`, tsErr.message)
          } else if (updated && updated.length > 0) {
            console.log(`trial_starts CLOSED as paid for ${userId} (${updated.length} row)`)
          }
        } catch (e) {
          console.warn(`trial_starts close (paid) exception:`, e)
        }
      }

      // Also update subscriptions table if it exists
      try {
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            status: 'active',
            plan: 'premium_monthly',
            source: 'revenueCat',
            current_period_end: expiresDate,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' })
      } catch (e) {
        // subscriptions table might not exist — ignore
        console.warn('subscriptions upsert skipped:', e)
      }

      await markEvent(supabase, eventId, 'applied')

    } else if (revokePremiumEvents.includes(event.type)) {
      // EXPIRATION — revoca el ESPEJO RevenueCat. Los grants manuales
      // (premium_manual_grants) no se tocan y los datos del usuario no se
      // eliminan: solo cambia el flag de acceso del espejo.
      const { error } = await supabase
        .from('profiles')
        .update({
          es_premium: false,
        })
        .eq('id', userId)

      if (error) {
        console.error('Error revoking premium:', error.message)
      }

      console.log(`Premium REVOKED for ${userId} — event: ${event.type}`)

      // [11 may 2026] Close trial_starts as 'expired' (trial reached
      // its natural end without converting to paid) or 'cancelled' if
      // BILLING_ISSUE during the trial period.
      try {
        const newStatus = event.type === 'EXPIRATION' ? 'expired' : 'cancelled'
        const { data: updated, error: tsErr } = await supabase
          .from('trial_starts')
          .update({ status: newStatus, completed_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('status', 'trial_active')
          .select('id')
        if (tsErr) {
          console.warn(`trial_starts close (${newStatus}) failed for ${userId}:`, tsErr.message)
        } else if (updated && updated.length > 0) {
          console.log(`trial_starts CLOSED as ${newStatus} for ${userId}`)
        }
      } catch (e) {
        console.warn(`trial_starts close (revoke) exception:`, e)
      }

      // Update subscriptions table
      try {
        await supabase
          .from('subscriptions')
          .update({
            status: event.type === 'EXPIRATION' ? 'expired' : 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
      } catch (e) {
        console.warn('subscriptions update skipped:', e)
      }

      await markEvent(supabase, eventId, 'applied')

    } else if (cancellationEvents.includes(event.type)) {
      // CANCELLATION — el usuario canceló la renovación: NO se revoca antes de
      // expiration_at (willRenew=false implícito; el acceso sigue vigente).
      //
      // REEMBOLSO (contrato real de RevenueCat): NO existe un evento 'REFUND'.
      // Un reembolso llega como CANCELLATION con cancel_reason=CUSTOMER_SUPPORT.
      // No se concede ni revoca por el NOMBRE del motivo: el acceso sigue el
      // expiration_at del payload (en reembolsos, RC lo pone en el pasado →
      // rama de revocación inmediata del espejo). Se registra refund_detected.
      const cancelReason: string = String(event.cancel_reason || '')
      const refundDetected = cancelReason === 'CUSTOMER_SUPPORT'
      let refundReconciled = false
      if (refundDetected) {
        // Señal de reembolso — pero NO determina por sí sola el estado final
        // (ni la renovación futura). Se RECONCILIA con el entitlement ACTUAL:
        //   RC inactivo → espejo inactivo; RC activo → conservar según su
        //   expiración real. Los grants promocionales ajenos no se tocan.
        // Sin servicio configurado → reconciliation_required (retry controlado)
        // y, mientras tanto, se aplica la lógica de expiración del payload.
        console.log(`Refund signal (CANCELLATION · CUSTOMER_SUPPORT) for ${userId}`)
        const state = await fetchRcEntitlementState(userId)
        if (state) {
          await applyReconciledState(supabase, userId, state)
          refundReconciled = true
        } else {
          console.log(`Refund: reconciliation pending for ${userId.slice(0, 8)}… (service unavailable)`)
        }
      }

      if (refundReconciled) {
        // Espejo ya fijado por la reconciliación — no aplicar la rama de
        // expiración del payload (seguimos al cierre de trial/subscriptions).
      } else if (event.expiration_at_ms && event.expiration_at_ms > Date.now()) {
        // Still has access — keep premium, update expiry (espejo coherente)
        const expiresDate = new Date(event.expiration_at_ms).toISOString()
        await supabase
          .from('profiles')
          .update({ fecha_premium: expiresDate, premium_until: expiresDate })
          .eq('id', userId)

        console.log(`Cancellation noted for ${userId} (${cancelReason || 'no reason'}) — access until ${expiresDate}`)
      } else {
        // Already expired (p. ej. reembolso con expiración inmediata) — revoca
        // SOLO el espejo RevenueCat; los grants manuales no se tocan.
        await supabase
          .from('profiles')
          .update({ es_premium: false })
          .eq('id', userId)

        console.log(`Premium mirror REVOKED for ${userId} — already expired (${cancelReason || 'no reason'})`)
      }

      // [11 may 2026] Close trial_starts as 'cancelled' if user cancels
      // DURING the trial (period_type=TRIAL and they hit "Cancel" in
      // App Store / Google Play). Their access continues to trial end,
      // but the lifecycle email pipeline should stop firing (don't
      // pressure someone who already opted out). Match status='trial_active'
      // so we only close trials that haven't converted yet.
      if (event.period_type === 'TRIAL') {
        try {
          const { data: updated, error: tsErr } = await supabase
            .from('trial_starts')
            .update({ status: 'cancelled', completed_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('status', 'trial_active')
            .select('id')
          if (tsErr) {
            console.warn(`trial_starts close (cancelled) failed for ${userId}:`, tsErr.message)
          } else if (updated && updated.length > 0) {
            console.log(`trial_starts CLOSED as cancelled (during trial) for ${userId}`)
          }
        } catch (e) {
          console.warn(`trial_starts close (cancelled) exception:`, e)
        }
      }

      // Update subscriptions table
      try {
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
      } catch (e) {
        console.warn('subscriptions update skipped:', e)
      }

      await markEvent(
        supabase, eventId,
        refundDetected ? (refundReconciled ? 'applied' : 'reconciliation_required') : 'applied',
      )

    } else if (event.type === 'BILLING_ISSUE') {
      // [18 jul 2026] BILLING_ISSUE NO revoca el acceso. Con grace period el
      // usuario sigue teniendo derecho hasta EXPIRATION; incluso sin gracia,
      // RevenueCat enviará el EXPIRATION correspondiente. Aquí solo se registra
      // la señal (billing_issue_flagged) y se marca la suscripción como
      // past_due informativo. Un RENEWAL posterior vuelve a escribir el espejo
      // activo (limpia la señal de facturación).
      console.log(`Billing issue flagged for ${userId} — access preserved until EXPIRATION`)
      try {
        await supabase
          .from('subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('user_id', userId)
      } catch (e) {
        console.warn('subscriptions update skipped:', e)
      }
      await markEvent(supabase, eventId, 'applied') // efecto = flag registrado, acceso conservado

    } else if (event.type === 'NON_RENEWING_PURCHASE') {
      // [18 jul 2026] Un RevenueCat Granted Entitlement (concesión promocional/
      // administrativa) llega como NON_RENEWING_PURCHASE con
      // period_type=PROMOTIONAL. NO confundir con TEMPORARY_ENTITLEMENT_GRANT
      // (acceso temporal por incidencias de tienda) ni con compras no
      // renovables de otros entitlements (planes individuales).
      const entIds: string[] = Array.isArray(event.entitlement_ids)
        ? event.entitlement_ids
        : (event.entitlement_id ? [event.entitlement_id] : [])
      const isPromo = event.period_type === 'PROMOTIONAL' || event.store === 'PROMOTIONAL'
      const grantsPro = entIds.includes('Correr Juntos Pro')
      if (isPromo && grantsPro) {
        // Espejo Premium activo con la expiración REAL del grant. NO es una
        // suscripción renovable (willRenew=false implícito — el cliente lo
        // deriva del entitlement PROMOTIONAL) y NO cuenta como compra pagada:
        // sin métricas de ingresos. Su expiración llegará como EXPIRATION (o
        // se reconcilia server-side).
        const expiresDate = event.expiration_at_ms
          ? new Date(event.expiration_at_ms).toISOString()
          : null
        const updates: Record<string, unknown> = {
          es_premium: true,
          subscription_period: 'PROMOTIONAL',
        }
        if (expiresDate) updates.premium_until = expiresDate
        const { error } = await supabase.from('profiles').update(updates).eq('id', userId)
        if (error) console.warn('Promotional grant mirror failed:', error.message)
        else console.log(`Promotional entitlement mirrored for ${userId} until ${expiresDate ?? 'n/a'}`)
        await markEvent(supabase, eventId, 'applied')
      } else {
        // Compra no renovable de OTRO entitlement (planes individuales, etc.):
        // no toca el espejo Premium (sus entitlements viven aparte).
        console.log(`NON_RENEWING_PURCHASE (${entIds.join(',') || 'no-entitlement'}) — premium mirror unchanged`)
        await markEvent(supabase, eventId, 'ignored')
      }

    } else if (event.type === 'TRANSFER') {
      // [18 jul 2026] TRANSFER — la compra se mueve entre App User IDs.
      // El payload de TRANSFER NO contiene de forma fiable expiration_at_ms,
      // product_id ni entitlement: NO se activa el destino ni se inventa una
      // expiración desde el payload. En su lugar:
      //   1. transferred_from[]/transferred_to[] se validan (UUIDs no anónimos;
      //      los $RCAnonymousID NUNCA se escriben en profiles).
      //   2. Cada identidad afectada se RECONCILIA consultando el estado ACTUAL
      //      de RevenueCat (fetchRcEntitlementState) y el espejo se actualiza
      //      SOLO con esa respuesta (origen se desactiva / destino se activa
      //      únicamente si RevenueCat lo confirma).
      //   3. Si el servicio no está configurado → reconciliation_required
      //      (retry controlado posterior); no se concede ni se revoca a ciegas.
      //   4. Sin aliases locales; idempotente (event.id + stream propio).
      const isRealUser = (id: unknown): id is string =>
        typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
      const affected: string[] = [
        ...(Array.isArray(event.transferred_from) ? event.transferred_from : []),
        ...(Array.isArray(event.transferred_to) ? event.transferred_to : []),
      ].filter(isRealUser)

      let reconciledAll = affected.length > 0
      for (const affectedId of affected) {
        const state = await fetchRcEntitlementState(affectedId)
        if (state) {
          await applyReconciledState(supabase, affectedId, state)
        } else {
          reconciledAll = false
          console.log(`TRANSFER: reconciliation pending for ${affectedId.slice(0, 8)}… (service unavailable)`)
        }
      }
      await markEvent(supabase, eventId, reconciledAll ? 'applied' : 'reconciliation_required')

    } else if (event.type === 'REFUND_REVERSED') {
      // [18 jul 2026] La tienda revirtió un reembolso. NO se concede Premium a
      // ciegas ni se espera indefinidamente: se RECONCILIA el entitlement
      // actual contra RevenueCat y el espejo se actualiza con esa respuesta.
      // Sin servicio configurado → reconciliation_required (retry controlado).
      const state = await fetchRcEntitlementState(userId)
      if (state) {
        await applyReconciledState(supabase, userId, state)
        await markEvent(supabase, eventId, 'applied')
      } else {
        console.log(`REFUND_REVERSED: reconciliation pending for ${userId.slice(0, 8)}…`)
        await markEvent(supabase, eventId, 'reconciliation_required')
      }

    } else {
      // Evento desconocido: se registra como ignorado y se responde 2xx sin
      // cambiar acceso (contrato: nunca romper por tipos nuevos).
      console.log(`Unhandled event type: ${event.type} — ignoring`)
      await markEvent(supabase, eventId, 'ignored')
    }

    return new Response(
      JSON.stringify({ ok: true, event_type: event.type, user_id: userId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('RevenueCat webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
