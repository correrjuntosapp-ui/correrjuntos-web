// Job: partner-quedadas
// Daily rotation: for each active partner club recurrence, ensures
// exactly 1 upcoming quedada exists. When the previous one passes, the
// next gets created automatically on the next cron tick.
//
// All date math + idempotency lives in the Postgres function
// `public.rotate_partner_quedadas()` — this is just the dispatcher.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';

export default async function runPartnerQuedadas(_req, res, env) {
  const supabase = createClient(SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.rpc('rotate_partner_quedadas');

  if (error) {
    console.error('[partner-quedadas] rpc error:', error.message);
    return res.status(500).json({ ok: false, error: error.message });
  }

  return res.status(200).json({
    ok: true,
    job: 'partner-quedadas',
    result: data,
  });
}
