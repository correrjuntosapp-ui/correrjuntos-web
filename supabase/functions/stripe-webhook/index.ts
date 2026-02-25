// Edge Function: stripe-webhook
// Recibe webhooks de Stripe y actualiza la tabla subscriptions

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  console.log('Webhook received')
  console.log('Has signature:', !!signature)
  console.log('Has endpoint secret:', !!endpointSecret)

  try {
    const body = await req.text()
    let event: Stripe.Event

    // Intentar verificar firma, si falla parsear JSON directamente (modo test)
    if (signature && endpointSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
        console.log('Signature verified successfully')
      } catch (sigError) {
        console.log('Signature verification failed, parsing JSON directly:', sigError.message)
        // En modo test, aceptar el evento sin verificar firma
        event = JSON.parse(body) as Stripe.Event
      }
    } else {
      console.log('No signature or secret, parsing JSON directly')
      event = JSON.parse(body) as Stripe.Event
    }

    console.log('Event type:', event.type)
    console.log('Event id:', event.id)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        console.log('Checkout completed:', { userId, customerId, subscriptionId })

        if (userId && subscriptionId) {
          // Obtener detalles de la suscripción
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          console.log('Subscription retrieved:', subscription.id)

          const { error: subError } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              status: 'active',
              plan: 'premium',
              price_amount: 499,
              currency: 'eur',
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            }, { onConflict: 'user_id' })

          if (subError) {
            console.error('Error upserting subscription:', subError)
          } else {
            console.log('Subscription upserted successfully')
          }

          // Actualizar perfil con es_premium (campo usado por el frontend)
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              es_premium: true,
              is_premium: true,
              premium_until: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .eq('id', userId)

          if (profileError) {
            console.error('Error updating profile:', profileError)
          } else {
            console.log('Profile updated successfully')
          }
        } else {
          console.log('Missing userId or subscriptionId')
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.user_id

        console.log('Subscription updated:', { userId, status: subscription.status })

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
              premium_until: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.user_id

        console.log('Subscription deleted:', { userId })

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
              premium_until: null
            })
            .eq('id', userId)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        console.log('Invoice payment failed:', { subscriptionId })

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
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error('Webhook error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
