// API Route: Claim a referral code (auth required)
// POST /api/referral-claim { code } + Authorization: Bearer <supabase-jwt>

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
// Reward length mirrors the App Store / Google Play free-trial length.
// Bumped to 14 days in Sprint 1 CRO pass for consistent brand messaging
// ("14 días gratis" everywhere) and to give referrals two full weekends.
const REWARD_DAYS = 14;
const MAX_REFERRALS_PER_USER = 20;
const MAX_ACCOUNT_AGE_DAYS = 30;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Verify auth
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.replace('Bearer ', '');

  const { code } = req.body || {};
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Missing referral code' });
  }

  try {
    // Create authenticated client to get user
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = user.id;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. Get referred user's profile
    const { data: referredProfile, error: rpErr } = await supabase
      .from('profiles')
      .select('id, referred_by, created_at')
      .eq('id', userId)
      .single();

    if (rpErr || !referredProfile) {
      return res.status(400).json({ error: 'Profile not found' });
    }

    // 2. Check if already referred
    if (referredProfile.referred_by) {
      return res.status(400).json({ error: 'already_claimed', message: 'Ya has usado un codigo de invitacion' });
    }

    // 3. Check account age
    const accountAge = (Date.now() - new Date(referredProfile.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (accountAge > MAX_ACCOUNT_AGE_DAYS) {
      return res.status(400).json({ error: 'account_too_old', message: 'Tu cuenta es demasiado antigua para usar un codigo' });
    }

    // 4. Look up referrer
    const { data: referrer, error: refErr } = await supabase
      .from('profiles')
      .select('id, referral_count, es_premium, fecha_premium')
      .eq('referral_code', code.toUpperCase())
      .single();

    if (refErr || !referrer) {
      return res.status(400).json({ error: 'invalid_code', message: 'Codigo de invitacion no valido' });
    }

    // 5. Self-referral check
    if (referrer.id === userId) {
      return res.status(400).json({ error: 'self_referral', message: 'No puedes usar tu propio codigo' });
    }

    // 6. Referral cap
    if (referrer.referral_count >= MAX_REFERRALS_PER_USER) {
      return res.status(400).json({ error: 'referrer_limit', message: 'Este usuario ha alcanzado el limite de invitaciones' });
    }

    // 7. Calculate premium expiry dates
    const now = new Date();
    const rewardMs = REWARD_DAYS * 24 * 60 * 60 * 1000;

    // For referrer: extend from current expiry or from now
    const referrerCurrentExpiry = referrer.fecha_premium ? new Date(referrer.fecha_premium) : null;
    const referrerBase = referrerCurrentExpiry && referrerCurrentExpiry > now ? referrerCurrentExpiry : now;
    const referrerNewExpiry = new Date(referrerBase.getTime() + rewardMs);

    // For referred: always from now (new user)
    const referredNewExpiry = new Date(now.getTime() + rewardMs);

    // 8. Execute all updates in sequence (no transaction in Supabase JS, but safe enough)

    // 8a. Insert referral claim
    const { error: claimErr } = await supabase.from('referral_claims').insert({
      referrer_id: referrer.id,
      referred_id: userId,
      referral_code: code.toUpperCase(),
      status: 'completed',
      referrer_premium_expires: referrerNewExpiry.toISOString(),
      referred_premium_expires: referredNewExpiry.toISOString(),
    });

    if (claimErr) {
      // Likely unique constraint violation (already claimed)
      if (claimErr.code === '23505') {
        return res.status(400).json({ error: 'already_claimed', message: 'Ya has usado un codigo de invitacion' });
      }
      throw claimErr;
    }

    // 8b. Update referred user profile
    await supabase.from('profiles').update({
      referred_by: referrer.id,
      es_premium: true,
      fecha_premium: referredNewExpiry.toISOString(),
    }).eq('id', userId);

    // 8c. Update referrer profile
    await supabase.from('profiles').update({
      referral_count: (referrer.referral_count || 0) + 1,
      es_premium: true,
      fecha_premium: referrerNewExpiry.toISOString(),
    }).eq('id', referrer.id);

    return res.status(200).json({
      success: true,
      premiumUntil: referredNewExpiry.toISOString(),
      referrerName: null, // Privacy
      rewardDays: REWARD_DAYS,
    });
  } catch (e) {
    console.error('referral-claim error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
