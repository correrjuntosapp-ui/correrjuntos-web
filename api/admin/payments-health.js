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
        const nowIso = new Date().toISOString();

        // Health agregado — 4 queries paralelas con .from()
        const [{ count: cActivos }, { count: cZombies }, { count: cPrem }, { count: cAll }] = await Promise.all([
            supabase.from('profiles').select('id', { count: 'exact', head: true })
                .eq('es_premium', true).gt('fecha_premium', nowIso),
            supabase.from('profiles').select('id', { count: 'exact', head: true })
                .eq('es_premium', true).or(`fecha_premium.is.null,fecha_premium.lte.${nowIso}`),
            supabase.from('profiles').select('id', { count: 'exact', head: true })
                .eq('es_premium', true),
            supabase.from('profiles').select('id', { count: 'exact', head: true }),
        ]);
        const activos = cActivos || 0;
        const zombies = cZombies || 0;
        const total_premium = cPrem || 0;
        const total_users = cAll || 0;

        // Premium activos (top 20 por más recientes)
        const { data: recentPremium } = await supabase
            .from('profiles')
            .select('id, email, nombre, fecha_premium, es_premium, created_at')
            .eq('es_premium', true)
            .order('fecha_premium', { ascending: false, nullsFirst: false })
            .limit(20);

        // Zombies — es_premium=true pero fecha caducada/null
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
