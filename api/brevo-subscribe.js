// API Route de Vercel para suscripción newsletter
// Guarda en Supabase + crea contacto en Brevo

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_LIST_ID = parseInt(process.env.BREVO_LIST_ID || '3', 10);

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, lang, source } = req.body || {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email' });
    }

    let supabaseOk = false;
    let brevoOk = false;
    let isDuplicate = false;

    // 1. Save to Supabase
    try {
        if (SUPABASE_SERVICE_KEY) {
            const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
            const { error } = await supabase
                .from('newsletter_subscribers')
                .insert({ email, lang: lang || 'es', source: source || 'landing' });

            if (error) {
                if (error.code === '23505') {
                    isDuplicate = true;
                    supabaseOk = true;
                } else {
                    console.error('Supabase error:', error);
                }
            } else {
                supabaseOk = true;
            }
        }
    } catch (err) {
        console.error('Supabase exception:', err);
    }

    // 2. Create/update contact in Brevo
    try {
        if (BREVO_API_KEY) {
            const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'api-key': BREVO_API_KEY
                },
                body: JSON.stringify({
                    email,
                    listIds: [BREVO_LIST_ID],
                    attributes: {
                        LANG: lang || 'es',
                        SOURCE: source || 'landing'
                    },
                    updateEnabled: true
                })
            });

            if (brevoRes.ok || brevoRes.status === 201 || brevoRes.status === 204) {
                brevoOk = true;
            } else {
                const brevoErr = await brevoRes.json().catch(() => ({}));
                if (brevoErr.code === 'duplicate_parameter') {
                    // Already exists in Brevo, update list membership
                    const updateRes = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
                        method: 'PUT',
                        headers: {
                            'accept': 'application/json',
                            'content-type': 'application/json',
                            'api-key': BREVO_API_KEY
                        },
                        body: JSON.stringify({
                            listIds: [BREVO_LIST_ID],
                            attributes: {
                                LANG: lang || 'es',
                                SOURCE: source || 'landing'
                            }
                        })
                    });
                    brevoOk = updateRes.ok || updateRes.status === 204;
                    isDuplicate = true;
                } else {
                    console.error('Brevo error:', brevoErr);
                }
            }
        }
    } catch (err) {
        console.error('Brevo exception:', err);
    }

    if (isDuplicate) {
        return res.status(409).json({ status: 'duplicate', message: 'Already subscribed' });
    }

    if (supabaseOk || brevoOk) {
        return res.status(201).json({ status: 'ok', supabase: supabaseOk, brevo: brevoOk });
    }

    return res.status(500).json({ error: 'Failed to subscribe' });
}
