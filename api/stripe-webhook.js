// API Route de Vercel para webhook de Stripe
// Activa Premium cuando se completa un pago

import { createClient } from '@supabase/supabase-js';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export const config = {
    api: {
        bodyParser: false,
    },
};

async function buffer(readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

function isDuplicateError(error) {
    if (!error) return false;
    return error.code === '23505' || String(error.message || '').toLowerCase().includes('duplicate key');
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!STRIPE_WEBHOOK_SECRET || !STRIPE_SECRET_KEY || !SUPABASE_SERVICE_KEY) {
        return res.status(500).json({ error: 'Webhook is not configured' });
    }

    const sig = req.headers['stripe-signature'];
    if (!sig) {
        return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    let event;
    try {
        const buf = await buffer(req);
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(STRIPE_SECRET_KEY);
        event = stripe.webhooks.constructEvent(buf, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: 'Webhook Error: ' + err.message });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { error: idempotencyError } = await supabase
        .from('stripe_webhook_events')
        .insert({
            event_id: event.id,
            event_type: event.type,
        });

    if (idempotencyError) {
        if (isDuplicateError(idempotencyError)) {
            return res.status(200).json({ received: true, duplicate: true });
        }
        console.error('Could not persist webhook event:', idempotencyError);
        return res.status(500).json({ error: 'Could not persist webhook event' });
    }

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const customerEmail = session.customer_email || session.customer_details?.email;

            if (customerEmail) {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('email', customerEmail)
                    .single();

                if (!profileError && profile) {
                    const currentPeriodEnd = new Date();
                    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

                    const { error: subError } = await supabase
                        .from('subscriptions')
                        .upsert({
                            user_id: profile.id,
                            status: 'active',
                            plan: 'premium',
                            stripe_customer_id: session.customer,
                            stripe_subscription_id: session.subscription,
                            current_period_end: currentPeriodEnd.toISOString(),
                            updated_at: new Date().toISOString(),
                        }, { onConflict: 'user_id' });

                    if (subError) {
                        console.error('Error updating subscription:', subError);
                        throw new Error('Database error');
                    }

                    await supabase
                        .from('profiles')
                        .update({ es_premium: true })
                        .eq('id', profile.id);
                }
            }
        }

        if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object;

            const { error } = await supabase
                .from('subscriptions')
                .update({ status: 'cancelled' })
                .eq('stripe_subscription_id', subscription.id);

            if (!error) {
                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('user_id')
                    .eq('stripe_subscription_id', subscription.id)
                    .single();

                if (sub) {
                    await supabase
                        .from('profiles')
                        .update({ es_premium: false })
                        .eq('id', sub.user_id);
                }
            }
        }

        await supabase
            .from('stripe_webhook_events')
            .update({ processed_at: new Date().toISOString() })
            .eq('event_id', event.id);

        return res.status(200).json({ received: true });
    } catch (err) {
        console.error('Webhook processing error:', err);

        await supabase
            .from('stripe_webhook_events')
            .delete()
            .eq('event_id', event.id);

        return res.status(400).json({ error: 'Webhook processing error' });
    }
}
