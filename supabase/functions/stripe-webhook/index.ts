// Edge Function: stripe-webhook
// Recibe webhooks de Stripe y actualiza la tabla subscriptions

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || ''
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })
  : null

function jsonResponse(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    status,
  })
}

function isDuplicateError(error: { code?: string; message?: string } | null) {
  if (!error) return false
  return error.code === '23505' || (error.message || '').toLowerCase().includes('duplicate key')
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  if (!stripe || !endpointSecret || !supabaseUrl || !supabaseServiceKey) {
    return jsonResponse({ error: 'Webhook is not configured' }, 500)
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return jsonResponse({ error: 'Missing stripe-signature header' }, 400)
  }

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid webhook signature'
    console.error('Webhook signature verification failed:', message)
    return jsonResponse({ error: 'Invalid webhook signature' }, 400)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { error: insertEventError } = await supabase
    .from('stripe_webhook_events')
    .insert({
      event_id: event.id,
      event_type: event.type,
    })

  if (insertEventError) {
    if (isDuplicateError(insertEventError)) {
      return jsonResponse({ received: true, duplicate: true }, 200)
    }

    console.error('Error storing webhook event for idempotency:', insertEventError)
    return jsonResponse({ error: 'Could not persist webhook event' }, 500)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (userId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          const { error: subError } = await supabase
            .from('subscriptions')
            .upsert(
              {
                user_id: userId,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                status: 'active',
                plan: 'premium',
                price_amount: 499,
                currency: 'eur',
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              },
              { onConflict: 'user_id' }
            )

          if (subError) {
            console.error('Error upserting subscription:', subError)
          }

          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              es_premium: true,
              is_premium: true,
              premium_until: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('id', userId)

          if (profileError) {
            console.error('Error updating profile:', profileError)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.user_id

        if (userId) {
          const status = subscription.status === 'active' ? 'active' : 'inactive'

          await supabase
            .from('subscriptions')
            .update({
              status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            })
            .eq('user_id', userId)

          await supabase
            .from('profiles')
            .update({
              es_premium: status === 'active',
              is_premium: status === 'active',
              premium_until: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.user_id

        if (userId) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              plan: 'free',
            })
            .eq('user_id', userId)

          await supabase
            .from('profiles')
            .update({
              es_premium: false,
              is_premium: false,
              premium_until: null,
            })
            .eq('id', userId)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const userId = subscription.metadata?.user_id

          if (userId) {
            await supabase
              .from('subscriptions')
              .update({ status: 'past_due' })
              .eq('user_id', userId)
          }
        }
        break
      }

      default:
        break
    }

    const { error: markProcessedError } = await supabase
      .from('stripe_webhook_events')
      .update({ processed_at: new Date().toISOString() })
      .eq('event_id', event.id)

    if (markProcessedError) {
      console.error('Error marking webhook event as processed:', markProcessedError)
      return jsonResponse({ error: 'Could not finalize webhook event' }, 500)
    }

    return jsonResponse({ received: true }, 200)
  } catch (err) {
    console.error('Webhook processing error:', err)

    // Allow retries when processing fails.
    await supabase
      .from('stripe_webhook_events')
      .delete()
      .eq('event_id', event.id)

    const message = err instanceof Error ? err.message : 'Webhook processing error'
    return jsonResponse({ error: message }, 400)
  }
})
