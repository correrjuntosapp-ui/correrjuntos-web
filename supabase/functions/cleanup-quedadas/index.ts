import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener fecha y hora actual en formato ISO
    const now = new Date()
    const today = now.toISOString().split('T')[0] // YYYY-MM-DD
    const currentTime = now.toTimeString().split(' ')[0] // HH:MM:SS

    // Borrar quedadas donde:
    // 1. La fecha es anterior a hoy, O
    // 2. La fecha es hoy pero la hora ya pasó

    // Primero borramos los participantes de quedadas pasadas
    const { data: quedadasPasadas } = await supabase
      .from('quedadas')
      .select('id, fecha, hora')

    const idsToDelete: string[] = []

    for (const q of quedadasPasadas || []) {
      const fechaHora = new Date(`${q.fecha}T${q.hora}`)
      if (fechaHora < now) {
        idsToDelete.push(q.id)
      }
    }

    if (idsToDelete.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No hay quedadas pasadas para borrar', deleted: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Borrar participantes primero (por foreign key)
    const { error: errPart } = await supabase
      .from('participantes')
      .delete()
      .in('quedada_id', idsToDelete)

    if (errPart) {
      console.error('Error borrando participantes:', errPart)
    }

    // Borrar quedadas pasadas
    const { error, count } = await supabase
      .from('quedadas')
      .delete()
      .in('id', idsToDelete)

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({
        message: `Borradas ${idsToDelete.length} quedadas pasadas`,
        deleted: idsToDelete.length,
        ids: idsToDelete
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
