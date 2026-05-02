// Admin endpoint: health check de pagos premium (RevenueCat → Supabase)
// Protegido por ADMIN_SECRET en query param o header.
// Devuelve JSON con: contadores agregados, últimos premium, zombies, próximos a caducar.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Auth: secret en query param ?key=... o header X-Admin-Secret
    const provided = req.query.key || req.headers['x-admin-secret'];
    if (!ADMIN_SECRET || provided !== ADMIN_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!SUPABASE_SERVICE_KEY) {
        return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY missing' });
    }

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        // Health agregado
        const healthQuery = `
            SELECT
              COUNT(*) FILTER (WHERE es_premium AND fecha_premium > NOW()) AS activos,
              COUNT(*) FILTER (WHERE es_premium AND (fecha_premium IS NULL OR fecha_premium <= NOW())) AS zombies,
              COUNT(*) FILTER (WHERE es_premium) AS total_premium,
              COUNT(*) AS total_users
            FROM profiles;
        `;
        const { data: healthRows, error: healthErr } = await supabase.rpc('exec_sql', { query: healthQuery }).catch(() => ({ data: null, error: 'rpc_exec_sql_unavailable' }));

        // Si no existe la RPC exec_sql, hacemos las queries con .from()
        let activos = 0, zombies = 0, total_premium = 0, total_users = 0;

        if (healthRows && Array.isArray(healthRows) && healthRows[0]) {
            ({ activos, zombies, total_premium, total_users } = healthRows[0]);
        } else {
            // Fallback con varias queries .from()
            const nowIso = new Date().toISOString();
            const [{ count: cActivos }, { count: cZombies }, { count: cPrem }, { count: cAll }] = await Promise.all([
                supabase.from('profiles').select('id', { count: 'exact', head: true })
                    .eq('es_premium', true).gt('fecha_premium', nowIso),
                supabase.from('profiles').select('id', { count: 'exact', head: true })
                    .eq('es_premium', true).or(`fecha_premium.is.null,fecha_premium.lte.${nowIso}`),
                supabase.from('profiles').select('id', { count: 'exact', head: true })
                    .eq('es_premium', true),
                supabase.from('profiles').select('id', { count: 'exact', head: true }),
            ]);
            activos = cActivos || 0;
            zombies = cZombies || 0;
            total_premium = cPrem || 0;
            total_users = cAll || 0;
        }

        // Premium activos (top 20 por más recientes)
        const { data: recentPremium } = await supabase
            .from('profiles')
            .select('id, email, nombre, fecha_premium, es_premium, created_at')
            .eq('es_premium', true)
            .order('fecha_premium', { ascending: false, nullsFirst: false })
            .limit(20);

        // Zombies — es_premium=true pero fecha caducada/null
        const nowIso = new Date().toISOString();
        const { data: zombiesList } = await supabase
            .from('profiles')
            .select('id, email, nombre, fecha_premium')
            .eq('es_premium', true)
            .or(`fecha_premium.is.null,fecha_premium.lte.${nowIso}`)
            .limit(20);

        // Caducan en próximos 7 días
        const sevenDays = new Date(Date.now() + 7 * 86400000).toISOString();
        const { data: expiringSoon } = await supabase
            .from('profiles')
            .select('id, email, nombre, fecha_premium')
            .eq('es_premium', true)
            .gt('fecha_premium', nowIso)
            .lt('fecha_premium', sevenDays)
            .order('fecha_premium', { ascending: true });

        return res.status(200).json({
            ok: true,
            generated_at: new Date().toISOString(),
            health: {
                activos: Number(activos),
                zombies: Number(zombies),
                total_premium: Number(total_premium),
                total_users: Number(total_users),
                conversion_pct: total_users ? +(Number(total_premium) / Number(total_users) * 100).toFixed(2) : 0,
            },
            recent_premium: recentPremium || [],
            zombies_list: zombiesList || [],
            expiring_soon_7d: expiringSoon || [],
        });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Internal error' });
    }
}
