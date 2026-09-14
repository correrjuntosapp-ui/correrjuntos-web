// F182 · Frontera pura del webhook. Strava no firma los POST: primero se
// valida el sobre y, para un owner ya vinculado, se reserva una llamada en el
// limitador durable compartido con el catch-up móvil.

export function isSafeActivityCreateEvent(event) {
  return event != null
    && event.object_type === 'activity'
    && event.aspect_type === 'create'
    && Number.isSafeInteger(event.owner_id)
    && event.owner_id > 0
    && Number.isSafeInteger(event.object_id)
    && event.object_id > 0;
}

export async function reserveStravaDetailSlot(sb, userId) {
  if (!sb || typeof sb.rpc !== 'function' || typeof userId !== 'string' || !userId) return false;
  try {
    const { data, error } = await sb.rpc('f182_take_strava_import_slot', { p_user_id: userId });
    return !error && data === true;
  } catch {
    return false;
  }
}
