// Registro server-side de trials (I/O con cliente inyectado).
// Importado por index.ts (Deno) y por los tests de integración (Node) con
// un cliente fake — misma lógica en ambos runtimes.
import { decideTrialRegistry } from './lifecycle-core.js';

// Devuelve 'ok' | 'noop' | 'failed'. Nunca lanza. Logs sanitizados
// (uid 8 chars; sin email/payload/receipt/token).
export async function ensureTrialRegistry(supabase, event, eventId) {
  try {
    const userId = String(event.app_user_id || '');
    const { data: existing, error: selErr } = await supabase
      .from('trial_starts')
      .select('id, status, started_at, completed_at, store_transaction_id, source')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
    if (selErr) { console.warn('trial_registry select failed:', selErr.message); return 'failed'; }
    const existingRow = existing && existing.length ? existing[0] : null;
    const decision = decideTrialRegistry(event, existingRow);
    const uid8 = userId.slice(0, 8);
    if (decision.action === 'noop') {
      console.log(JSON.stringify({ scope: 'trial_registry', rc_event: eventId, type: event.type, action: 'noop', reason: decision.reason, trial: uid8 }));
      return 'noop';
    }
    const { data: prof } = await supabase.from('profiles').select('email, nombre').eq('id', userId).maybeSingle();
    const row = {
      ...decision.row,
      email: prof?.email ?? null,
      nombre: prof?.nombre ?? null,
      lang: 'es', // profiles no tiene columna de idioma (bug v14); el cliente la fija si corre
    };
    if (decision.action === 'insert') {
      const { error } = await supabase.from('trial_starts').insert(row);
      if (error && error.code === '23505') {
        // El cliente ganó la carrera: converger actualizando su fila activa.
        const { error: convErr } = await supabase.from('trial_starts').update(row)
          .eq('user_id', userId).eq('status', 'trial_active');
        if (convErr) { console.warn('trial_registry converge failed:', convErr.message); return 'failed'; }
        console.log(JSON.stringify({ scope: 'trial_registry', rc_event: eventId, type: event.type, action: 'update', reason: 'converged_after_conflict', trial: uid8 }));
        return 'ok';
      }
      if (error) { console.warn('trial_registry insert failed:', error.message); return 'failed'; }
      console.log(JSON.stringify({ scope: 'trial_registry', rc_event: eventId, type: event.type, action: 'insert', reason: decision.reason, trial: uid8, product: decision.row?.reference, store: event.store || null }));
      return 'ok';
    }
    const { error: upErr } = await supabase.from('trial_starts').update(row).eq('id', existingRow.id);
    if (upErr) { console.warn('trial_registry update failed:', upErr.message); return 'failed'; }
    console.log(JSON.stringify({ scope: 'trial_registry', rc_event: eventId, type: event.type, action: 'update', reason: decision.reason, trial: uid8 }));
    return 'ok';
  } catch (e) {
    console.warn('trial_registry exception:', e?.message);
    return 'failed';
  }
}
