// Edge Function: create-portal-session
// Crea una sesión del portal de cliente de Stripe para gestionar suscripción

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { user_id, email, return_url } = body

    console.log('Portal session request:', { user_id, email })

    if (!user_id || !email) {
      return new Response(
        JSON.stringify({ error: 'user_id and email are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Buscar cliente en Stripe por email
    const customers = await stripe.customers.list({ email, limit: 1 })

    if (customers.data.length === 0) {
      // Si no hay cliente, intentar buscar por user_id en la tabla subscriptions
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user_id)
        .single()

      if (!sub?.stripe_customer_id) {
        return new Response(
          JSON.stringify({ error: 'No se encontró tu cuenta de Stripe. Contacta soporte.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        )
      }

      // Crear sesión del portal con el customer_id de la tabla
      const session = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id,
        return_url: return_url || 'https://correrjuntos.com',
      })

      return new Response(
        JSON.stringify({ url: session.url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Crear sesión del portal de cliente
    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: return_url || 'https://correrjuntos.com',
    })

    console.log('Portal session created:', session.id)

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error creating portal session:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Error creando sesión del portal' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
