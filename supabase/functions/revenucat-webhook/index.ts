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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
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

      const { error } = await supabase
        .from('profiles')
        .update({
          es_premium: true,
          fecha_premium: expiresDate,
        })
        .eq('id', userId)

      if (error) {
        console.error('Error granting premium:', error.message)
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      console.log(`Premium GRANTED for ${userId} until ${expiresDate}`)

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
