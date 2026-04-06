import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── CORS headers for mobile + web ──
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const MAX_BATCH_SIZE = 100

interface IncomingEvent {
  event_name: string
  params?: Record<string, unknown>
  session_id?: string
  platform?: string
  app_version?: string
  created_at?: string
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  // ── Auth: extract user from JWT ──
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Missing or invalid Authorization header' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const token = authHeader.replace('Bearer ', '')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // Verify the JWT to get user_id
  const authClient = createClient(supabaseUrl, serviceRoleKey)
  const { data: { user }, error: authError } = await authClient.auth.getUser(token)

  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  // ── Parse body ──
  let body: { events?: IncomingEvent[] }
  try {
    body = await req.json()
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const events = body.events
  if (!Array.isArray(events) || events.length === 0) {
    return new Response(
      JSON.stringify({ error: 'No events provided' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  if (events.length > MAX_BATCH_SIZE) {
    return new Response(
      JSON.stringify({ error: `Batch too large. Maximum ${MAX_BATCH_SIZE} events per request.` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  // ── Validate & build rows ──
  const rows = []
  for (const evt of events) {
    if (!evt.event_name || typeof evt.event_name !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Each event must have a non-empty event_name string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }
    rows.push({
      user_id: user.id,
      event_name: evt.event_name,
      params: evt.params ?? {},
      session_id: evt.session_id ?? null,
      platform: evt.platform ?? null,
      app_version: evt.app_version ?? null,
      created_at: evt.created_at ?? new Date().toISOString(),
    })
  }

  // ── Batch insert using service role (bypasses RLS) ──
  const adminClient = createClient(supabaseUrl, serviceRoleKey)
  const { error: insertError } = await adminClient
    .from('analytics_events')
    .insert(rows)

  if (insertError) {
    console.error('Insert error:', insertError)
    return new Response(
      JSON.stringify({ error: 'Failed to insert events', detail: insertError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  return new Response(
    JSON.stringify({ inserted: rows.length }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  )
})
