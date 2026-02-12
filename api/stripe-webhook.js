// API Route de Vercel para webhook de Stripe
// Activa Premium cuando se completa un pago

import { createClient } from '@supabase/supabase-js';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export const config = {
    api: {
        bodyParser: false, // Necesario para verificar la firma de Stripe
    },
};

async function buffer(readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        // Importar Stripe
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        // Verificar la firma del webhook
        if (STRIPE_WEBHOOK_SECRET) {
            event = stripe.webhooks.constructEvent(buf, sig, STRIPE_WEBHOOK_SECRET);
        } else {
            // En desarrollo, parsear directamente
            event = JSON.parse(buf.toString());
        }
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Manejar el evento
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        console.log('Checkout completed:', session);

        // Obtener el email del cliente
        const customerEmail = session.customer_email || session.customer_details?.email;

        if (customerEmail) {
            try {
                // Conectar a Supabase con service key (bypass RLS)
                const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

                // Buscar el usuario por email
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('email', customerEmail)
                    .single();

                if (profileError || !profile) {
                    console.error('User not found:', customerEmail);
                    return res.status(200).json({ received: true, warning: 'User not found' });
                }

                // Calcular fecha de expiración (1 mes desde ahora)
                const currentPeriodEnd = new Date();
                currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

                // Actualizar o insertar suscripción
                const { error: subError } = await supabase
                    .from('subscriptions')
                    .upsert({
                        user_id: profile.id,
                        status: 'active',
                        plan: 'premium',
                        stripe_customer_id: session.customer,
                        stripe_subscription_id: session.subscription,
                        current_period_end: currentPeriodEnd.toISOString(),
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id' });

                if (subError) {
                    console.error('Error updating subscription:', subError);
                    return res.status(500).json({ error: 'Database error' });
                }

                // También actualizar es_premium en profiles
                await supabase
                    .from('profiles')
                    .update({ es_premium: true })
                    .eq('id', profile.id);

                console.log('Premium activated for:', customerEmail);

            } catch (dbError) {
                console.error('Database error:', dbError);
                return res.status(500).json({ error: 'Database error' });
            }
        }
    }

    // Manejar cancelación de suscripción
    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;

        try {
            const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

            // Desactivar premium
            const { error } = await supabase
                .from('subscriptions')
                .update({ status: 'cancelled' })
                .eq('stripe_subscription_id', subscription.id);

            if (!error) {
                // También actualizar es_premium en profiles
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

            console.log('Subscription cancelled:', subscription.id);
        } catch (err) {
            console.error('Error cancelling subscription:', err);
        }
    }

    return res.status(200).json({ received: true });
}
