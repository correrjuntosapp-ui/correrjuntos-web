// API Route: Validate a referral code (public, no auth required)
// GET /api/referral-validate?code=ABC123

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { code } = req.query;
  if (!code || typeof code !== 'string' || code.length < 5 || code.length > 10) {
    return res.status(400).json({ valid: false, error: 'Invalid code format' });
  }

  try {
    if (!SUPABASE_SERVICE_KEY) {
      return res.status(500).json({ valid: false, error: 'Missing service key config' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nombre, photo_url')
      .eq('referral_code', code.toUpperCase())
      .single();

    if (error || !data) {
      return res.status(200).json({ valid: false });
    }

    // Return first name only for privacy
    const firstName = data.nombre ? data.nombre.split(' ')[0] : 'Un runner';

    return res.status(200).json({
      valid: true,
      referrerName: firstName,
      referrerPhoto: data.photo_url || null,
    });
  } catch (e) {
    console.error('referral-validate error:', e);
    return res.status(500).json({ valid: false, error: 'Server error' });
  }
}
