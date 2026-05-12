// Edge Function: create-checkout
// Crea una sesion de Stripe Checkout para suscripcion Premium

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || ''
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = (Deno.env.get('SERVICE_ROLE_KEY_NEW') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) || ''
const rawAllowlist = Deno.env.get('PAYMENT_URL_ALLOWLIST') || ''

const stripe = stripeKey
  ? new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })
  : null

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function parseAllowlist(value: string): URL[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => new URL(item))
}

function isAllowedUrl(urlValue: string, allowlist: URL[]): boolean {
  let parsed: URL
  try {
    parsed = new URL(urlValue)
  } catch {
    return false
  }

  return allowlist.some((allowed) => {
    const isHttpAllowed = allowed.protocol === 'http:' || allowed.protocol === 'https:'

    if (isHttpAllowed) {
      const isHttpCandidate = parsed.protocol === 'http:' || parsed.protocol === 'https:'
      return isHttpCandidate && parsed.origin === allowed.origin
    }

    return parsed.href === allowed.href
  })
}

function getBearerToken(req: Request): string | null {
  const authHeader = req.headers.get('authorization') || ''
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return null
  }
  return authHeader.slice(7).trim() || null
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    )
  }

  if (!stripe || !supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: 'Payment system not configured' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  let allowlist: URL[]
  try {
    allowlist = parseAllowlist(rawAllowlist)
  } catch {
    return new Response(
      JSON.stringify({ error: 'Payment URL allowlist is invalid' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  if (!allowlist.length) {
    return new Response(
      JSON.stringify({ error: 'Payment URL allowlist is not configured' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  const token = getBearerToken(req)
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    )
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token)

  if (authError || !authData?.user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    )
  }

  try {
    const body = await req.json().catch(() => ({}))

    const successUrl = body?.success_url || 'https://correrjuntos.com/?premium=success'
    const cancelUrl = body?.cancel_url || 'https://correrjuntos.com/?premium=canceled'

    if (!isAllowedUrl(successUrl, allowlist) || !isAllowedUrl(cancelUrl, allowlist)) {
      return new Response(
        JSON.stringify({ error: 'URL not allowed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const userId = authData.user.id
    const email = (authData.user.email || '').trim()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'User email is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    let customer
    const existingCustomers = await stripe.customers.list({ email, limit: 1 })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
      await stripe.customers.update(customer.id, {
        metadata: {
          ...customer.metadata,
          user_id: userId,
        },
      })
    } else {
      customer = await stripe.customers.create({
        email,
        metadata: { user_id: userId },
      })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'CorrerJuntos Premium',
              description: 'Estadisticas avanzadas, quedadas ilimitadas, badges exclusivos.',
            },
            unit_amount: 499,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { user_id: userId },
      subscription_data: { metadata: { user_id: userId } },
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error:', error)
    const message = error instanceof Error ? error.message : 'Error creando sesion de pago'
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
