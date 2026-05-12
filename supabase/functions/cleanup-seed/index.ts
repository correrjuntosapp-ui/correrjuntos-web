import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Cleanup Seed Content
 *
 * Esta función se ejecuta diariamente para:
 * 1. Eliminar contenido seed en ciudades con suficiente contenido real (>15 quedadas)
 * 2. Actualizar las fechas de quedadas seed para mantenerlas en el futuro
 *
 * Se puede ejecutar manualmente o programar con pg_cron
 */

interface CleanupResult {
  ciudad: string
  quedadas_eliminadas: number
  message: string
}

interface SeedStats {
  ciudad: string
  quedadas_reales: number
  quedadas_seed: number
  porcentaje_real: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = (Deno.env.get('SERVICE_ROLE_KEY_NEW') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const results: CleanupResult[] = []
    const threshold = 15 // Umbral de quedadas reales para eliminar seed

    // Obtener ciudades únicas con quedadas
    const { data: ciudadesData, error: ciudadesError } = await supabase
      .from('quedadas')
      .select('ciudad')

    if (ciudadesError) {
      throw ciudadesError
    }

    // Obtener ciudades únicas
    const ciudades = [...new Set((ciudadesData || []).map(q => q.ciudad).filter(Boolean))]

    const today = new Date().toISOString().split('T')[0]

    for (const ciudad of ciudades) {
      // Contar quedadas reales futuras en esta ciudad
      const { count: realCount, error: countError } = await supabase
        .from('quedadas')
        .select('id', { count: 'exact', head: true })
        .eq('ciudad', ciudad)
        .eq('es_seed', false)
        .gte('fecha', today)

      if (countError) {
        console.error(`Error contando quedadas en ${ciudad}:`, countError)
        continue
      }

      if ((realCount || 0) >= threshold) {
        // Obtener IDs de quedadas seed a eliminar
        const { data: seedQuedadas, error: seedError } = await supabase
          .from('quedadas')
          .select('id')
          .eq('ciudad', ciudad)
          .eq('es_seed', true)

        if (seedError || !seedQuedadas || seedQuedadas.length === 0) {
          continue
        }

        const seedIds = seedQuedadas.map(q => q.id)

        // Eliminar participaciones seed
        const { error: partError } = await supabase
          .from('participantes')
          .delete()
          .in('quedada_id', seedIds)

        if (partError) {
          console.error(`Error eliminando participantes seed en ${ciudad}:`, partError)
        }

        // Eliminar quedadas seed
        const { error: delError } = await supabase
          .from('quedadas')
          .delete()
          .in('id', seedIds)

        if (delError) {
          console.error(`Error eliminando quedadas seed en ${ciudad}:`, delError)
          continue
        }

        results.push({
          ciudad,
          quedadas_eliminadas: seedIds.length,
          message: `Ciudad ${ciudad} tiene ${realCount} quedadas reales. Eliminadas ${seedIds.length} seed.`
        })
      }
    }

    // Regenerar fechas de quedadas seed antiguas (mantenerlas futuras)
    const { data: oldSeedQuedadas, error: oldSeedError } = await supabase
      .from('quedadas')
      .select('id')
      .eq('es_seed', true)
      .lt('fecha', today)

    let regeneratedCount = 0
    if (!oldSeedError && oldSeedQuedadas && oldSeedQuedadas.length > 0) {
      for (const q of oldSeedQuedadas) {
        // Generar fecha aleatoria entre 1 y 14 días en el futuro
        const daysOffset = Math.floor(Math.random() * 14) + 1
        const newDate = new Date()
        newDate.setDate(newDate.getDate() + daysOffset)
        const newDateStr = newDate.toISOString().split('T')[0]

        const { error: updateError } = await supabase
          .from('quedadas')
          .update({ fecha: newDateStr, updated_at: new Date().toISOString() })
          .eq('id', q.id)

        if (!updateError) {
          regeneratedCount++
        }
      }
    }

    // Obtener estadísticas finales
    const stats: SeedStats[] = []
    for (const ciudad of ciudades) {
      const { count: realCount } = await supabase
        .from('quedadas')
        .select('id', { count: 'exact', head: true })
        .eq('ciudad', ciudad)
        .eq('es_seed', false)
        .gte('fecha', today)

      const { count: seedCount } = await supabase
        .from('quedadas')
        .select('id', { count: 'exact', head: true })
        .eq('ciudad', ciudad)
        .eq('es_seed', true)
        .gte('fecha', today)

      const total = (realCount || 0) + (seedCount || 0)
      stats.push({
        ciudad,
        quedadas_reales: realCount || 0,
        quedadas_seed: seedCount || 0,
        porcentaje_real: total > 0 ? Math.round(((realCount || 0) / total) * 100) : 0
      })
    }

    return new Response(
      JSON.stringify({
        message: 'Cleanup seed completado',
        timestamp: new Date().toISOString(),
        cleanup_results: results,
        dates_regenerated: regeneratedCount,
        current_stats: stats.sort((a, b) => b.quedadas_reales - a.quedadas_reales)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error en cleanup-seed:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
