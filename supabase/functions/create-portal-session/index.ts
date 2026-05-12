// Edge Function: create-portal-session
// Crea una sesion del portal de cliente de Stripe para gestionar suscripcion

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
    const returnUrl = body?.return_url || 'https://correrjuntos.com'

    if (!isAllowedUrl(returnUrl, allowlist)) {
      return new Response(
        JSON.stringify({ error: 'URL not allowed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const userId = authData.user.id
    const userEmail = (authData.user.email || '').trim()
    let customerId: string | null = null

    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 })
      if (customers.data.length > 0) {
        customerId = customers.data[0].id
      }
    }

    if (!customerId) {
      const { data: sub } = await supabaseAdmin
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single()

      customerId = sub?.stripe_customer_id || null
    }

    if (!customerId) {
      return new Response(
        JSON.stringify({ error: 'No se encontro tu cuenta de Stripe. Contacta soporte.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error creating portal session:', error)
    const message = error instanceof Error ? error.message : 'Error creando sesion del portal'
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
