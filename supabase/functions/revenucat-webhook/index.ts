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
//
// [8 jul 2026] FIX crítico: el select de profiles pedía la columna `lang`,
// que NO existe → la query fallaba entera → la fila de trial_starts nunca
// se creaba (el fix del 22 jun nunca llegó a funcionar). Detectado con el
// primer trial real de la historia (test del founder). lang ahora es 'es'
// por defecto (el cliente iap.ts, que sí conoce el idioma, actúa de
// belt-and-suspenders idempotente).
// ============================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify webhook authorization
    const authHeader = req.headers.get('authorization')
    const webhookSecret = Deno.env.get('REVENUCAT_WEBHOOK_SECRET')

    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      console.error('Unauthorized webhook call')
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

    // Events that grant premium
    const grantPremiumEvents = [
      'INITIAL_PURCHASE',
      'RENEWAL',
      'PRODUCT_CHANGE',  // Upgrade/downgrade
      'UNCANCELLATION',  // Re-subscribed after cancel
    ]

    // Events that revoke premium
    const revokePremiumEvents = [
      'EXPIRATION',
      'BILLING_ISSUE',   // Payment failed
    ]

    // Events that might revoke (grace period ended)
    const maybeRevokeEvents = [
      'CANCELLATION',  // Canceled but might still have access until period end
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

      // [22 jun 2026] FIX pipeline lifecycle: crear la fila trial_starts AQUÍ
      // (server-side) en cuanto empieza el trial. El webhook es la fuente
      // fiable (recibe todos los eventos). Idempotente: ignora 23505 (índice
      // UNIQUE user_id WHERE status='trial_active') por si el cliente también
      // la insertó.
      // [8 jul 2026] profiles NO tiene columna `lang` — el select antiguo con
      // `lang` hacía fallar la query entera y este bloque nunca insertaba.
      if (isTrial && event.type === 'INITIAL_PURCHASE') {
        try {
          const { data: prof, error: profErr } = await supabase
            .from('profiles')
            .select('email, nombre')
            .eq('id', userId)
            .single()
          if (profErr) console.warn(`trial_starts profile lookup failed for ${userId}:`, profErr.message)
          const productId: string = event.product_id || event.product_identifier || ''
          const planType =
            productId.toLowerCase().includes('yearly') || productId.toLowerCase().includes('annual')
              ? 'yearly'
              : 'monthly'
          if (prof?.email) {
            const { error: tsErr } = await supabase.from('trial_starts').insert({
              user_id: userId,
              email: prof.email,
              nombre: prof.nombre || null,
              lang: 'es',
              plan_type: planType,
              status: 'trial_active',
              reference: productId,
            })
            if (tsErr && (tsErr as { code?: string }).code !== '23505') {
              console.warn(`trial_starts create failed for ${userId}:`, tsErr.message)
            } else {
              console.log(`trial_starts CREATED (server) for ${userId} · ${planType}`)
            }
          }
        } catch (e) {
          console.warn(`trial_starts create exception:`, e)
        }
      }

      // [11 may 2026] Close trial_starts lifecycle row when trial converts to paid.
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

    } else if (revokePremiumEvents.includes(event.type)) {
      // Revoke premium
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

    } else if (maybeRevokeEvents.includes(event.type)) {
      // CANCELLATION — user canceled but may still have access
      // Check if expiration is in the future
      if (event.expiration_at_ms && event.expiration_at_ms > Date.now()) {
        // Still has access — keep premium, update expiry
        const expiresDate = new Date(event.expiration_at_ms).toISOString()
        await supabase
          .from('profiles')
          .update({ fecha_premium: expiresDate })
          .eq('id', userId)

        console.log(`Cancellation noted for ${userId} — access until ${expiresDate}`)
      } else {
        // Already expired — revoke
        await supabase
          .from('profiles')
          .update({ es_premium: false })
          .eq('id', userId)

        console.log(`Premium REVOKED for ${userId} — already expired`)
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

    } else {
      console.log(`Unhandled event type: ${event.type} — ignoring`)
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
