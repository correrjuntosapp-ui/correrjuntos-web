// API Route: Get referral stats for current user (auth required)
// GET /api/referral-status + Authorization: Bearer <supabase-jwt>

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.replace('Bearer ', '');

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user's referral code and count
    const { data: profile } = await supabase
      .from('profiles')
      .select('referral_code, referral_count, referred_by')
      .eq('id', user.id)
      .single();

    // Get recent referral claims
    const { data: claims } = await supabase
      .from('referral_claims')
      .select('id, referred_id, referrer_premium_expires, created_at')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get referred users' names
    let referrals = [];
    if (claims && claims.length > 0) {
      const referredIds = claims.map(c => c.referred_id);
      const { data: referredProfiles } = await supabase
        .from('profiles')
        .select('id, nombre, foto_perfil')
        .in('id', referredIds);

      const profileMap = {};
      (referredProfiles || []).forEach(p => { profileMap[p.id] = p; });

      referrals = claims.map(c => ({
        id: c.id,
        name: profileMap[c.referred_id]?.nombre?.split(' ')[0] || 'Runner',
        photo: profileMap[c.referred_id]?.foto_perfil || null,
        date: c.created_at,
        premiumUntil: c.referrer_premium_expires,
      }));
    }

    return res.status(200).json({
      referralCode: profile?.referral_code || null,
      referralCount: profile?.referral_count || 0,
      wasReferred: !!profile?.referred_by,
      referrals,
    });
  } catch (e) {
    console.error('referral-status error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
