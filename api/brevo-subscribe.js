// API Route de Vercel para suscripción newsletter
// Guarda en Supabase + crea contacto en Brevo + trigger DOI / welcome automation

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_LIST_ID = parseInt(process.env.BREVO_LIST_ID || '3', 10);
// Optional: set these in Vercel env to enable DOI + welcome automation
const BREVO_DOI_TEMPLATE_ID = parseInt(process.env.BREVO_DOI_TEMPLATE_ID || '0', 10);
const BREVO_REDIRECT_URL = process.env.BREVO_REDIRECT_URL || 'https://www.correrjuntos.com/blog/';
const BREVO_WELCOME_TEMPLATE_ES = parseInt(process.env.BREVO_WELCOME_TEMPLATE_ES || '0', 10);
const BREVO_WELCOME_TEMPLATE_EN = parseInt(process.env.BREVO_WELCOME_TEMPLATE_EN || '0', 10);

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

    const { email, lang, source, lead_magnet } = req.body || {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email' });
    }

    const contactLang = lang || 'es';
    const contactSource = source || 'landing';
    const contactLeadMagnet = lead_magnet || '';
    // Lead-magnet signups should land on the thank-you page after DOI confirmation
    // so the user sees the PDF download immediately. For other sources, use the
    // default redirect (configured per-deploy via BREVO_REDIRECT_URL env var).
    const dynamicRedirect = contactLeadMagnet === 'plan-10k-preview'
        ? `https://www.correrjuntos.com/blog/descarga-plan-10k/`
        : BREVO_REDIRECT_URL;
    let supabaseOk = false;
    let brevoOk = false;
    let isDuplicate = false;
    let isNewSubscriber = false;

    // 1. Save to Supabase
    try {
        if (SUPABASE_SERVICE_KEY) {
            const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
            const { error } = await supabase
                .from('newsletter_subscribers')
                .insert({ email, lang: contactLang, source: contactSource });

            if (error) {
                if (error.code === '23505') {
                    isDuplicate = true;
                    supabaseOk = true;
                } else {
                    console.error('Supabase error:', error);
                }
            } else {
                supabaseOk = true;
                isNewSubscriber = true;
            }
        }
    } catch (err) {
        console.error('Supabase exception:', err);
    }

    // 2. Create/update contact in Brevo (with DOI support)
    try {
        if (BREVO_API_KEY) {
            // If DOI template is configured, use Double Opt-In flow
            if (BREVO_DOI_TEMPLATE_ID > 0 && !isDuplicate) {
                const doiRes = await fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation', {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'content-type': 'application/json',
                        'api-key': BREVO_API_KEY
                    },
                    body: JSON.stringify({
                        email,
                        includeListIds: [BREVO_LIST_ID],
                        templateId: BREVO_DOI_TEMPLATE_ID,
                        redirectionUrl: dynamicRedirect,
                        attributes: {
                            LANG: contactLang,
                            SOURCE: contactSource,
                            LEAD_MAGNET: contactLeadMagnet
                        }
                    })
                });
                brevoOk = doiRes.ok || doiRes.status === 201 || doiRes.status === 204;
                if (!brevoOk) {
                    const doiErr = await doiRes.json().catch(() => ({}));
                    if (doiErr.code === 'duplicate_parameter') {
                        isDuplicate = true;
                        brevoOk = true;
                    } else {
                        console.error('Brevo DOI error:', doiErr);
                        // Fallback to direct contact creation
                    }
                }
            }

            // Direct contact creation (no DOI or as fallback)
            if (!brevoOk) {
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
                            LANG: contactLang,
                            SOURCE: contactSource,
                            LEAD_MAGNET: contactLeadMagnet
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
                                    LANG: contactLang,
                                    SOURCE: contactSource
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

            // 3. Send welcome email for NEW subscribers (if template configured)
            if (brevoOk && isNewSubscriber && !isDuplicate && BREVO_DOI_TEMPLATE_ID === 0) {
                const welcomeTemplateId = contactLang === 'en' ? BREVO_WELCOME_TEMPLATE_EN : BREVO_WELCOME_TEMPLATE_ES;
                if (welcomeTemplateId > 0) {
                    try {
                        await fetch('https://api.brevo.com/v3/smtp/email', {
                            method: 'POST',
                            headers: {
                                'accept': 'application/json',
                                'content-type': 'application/json',
                                'api-key': BREVO_API_KEY
                            },
                            body: JSON.stringify({
                                templateId: welcomeTemplateId,
                                to: [{ email }],
                                params: {
                                    LANG: contactLang,
                                    SOURCE: contactSource
                                }
                            })
                        });
                    } catch (welcomeErr) {
                        console.error('Welcome email error:', welcomeErr);
                        // Non-blocking: welcome email failure shouldn't affect subscription
                    }
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
