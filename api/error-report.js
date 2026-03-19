// API Route: POST /api/error-report
// Receives client-side error beacons and stores in Supabase error_logs table.
// Non-critical: always returns 200 to avoid blocking the client.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// In-memory rate limiting (per Vercel instance)
const rateMap = new Map();
const RATE_LIMIT = 20;     // max requests per IP per window
const RATE_WINDOW = 60000; // 1 minute

function isRateLimited(ip) {
    const now = Date.now();
    const entry = rateMap.get(ip);
    if (!entry || now - entry.start > RATE_WINDOW) {
        rateMap.set(ip, { start: now, count: 1 });
        return false;
    }
    entry.count++;
    return entry.count > RATE_LIMIT;
}

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(200).json({ ok: false, reason: 'method' });

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) return res.status(200).json({ ok: false, reason: 'rate_limit' });

    try {
        const body = req.body;
        if (!body || !body.context || !body.message) {
            return res.status(200).json({ ok: false, reason: 'invalid_body' });
        }

        if (!SUPABASE_SERVICE_KEY) {
            console.error('SUPABASE_SERVICE_KEY not set');
            return res.status(200).json({ ok: false, reason: 'config' });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        const { error } = await supabase.from('error_logs').insert({
            context: String(body.context).substring(0, 100),
            message: String(body.message).substring(0, 1000),
            stack: body.stack ? String(body.stack).substring(0, 2000) : null,
            url: body.url ? String(body.url).substring(0, 500) : null,
            user_agent: body.userAgent ? String(body.userAgent).substring(0, 200) : null,
            session_id: body.sessionId ? String(body.sessionId).substring(0, 50) : null,
            severity: ['error', 'critical'].includes(body.severity) ? body.severity : 'error',
            ip: ip.substring(0, 45)
        });

        if (error) {
            console.error('Error inserting error_log:', error.message);
            return res.status(200).json({ ok: false, reason: 'db' });
        }

        return res.status(200).json({ ok: true });
    } catch (e) {
        console.error('error-report handler:', e.message);
        return res.status(200).json({ ok: false, reason: 'exception' });
    }
}
