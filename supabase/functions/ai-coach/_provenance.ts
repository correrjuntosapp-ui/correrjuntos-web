/**
 * F183 — fail-closed boundary for activities entering AI or derived analytics.
 * Apply to canonical server rows BEFORE selecting metrics or aggregating.
 * Null/missing provenance is not evidence of independent collection.
 * Health imports are excluded until their upstream origin is verifiable.
 */
export const AI_DATA_PROVENANCE_VERSION = 'first_party_only_v1_2026_09';

type Row = Record<string, unknown>;

/** A first-party row must positively include every applicable origin column. */
export function isFirstPartyActivity(row: Row | null | undefined, kind: 'run' | 'strength' = 'run'): boolean {
  if (!row || typeof row !== 'object') return false;
  // Any non-null marker is a veto, including malformed/empty/zero identifiers.
  for (const key of ['strava_activity_id', 'stravaActivityId', 'external_provider', 'external_activity_id']) {
    if (key in row && row[key] !== null) return false;
  }
  if (kind === 'strength') {
    return (row.source === 'planned' || row.source === 'free')
      && row.external_provider === null && row.external_activity_id === null;
  }
  return row.source === 'app' && row.strava_activity_id === null;
}

/**
 * Historical coach text has no trustworthy field-level provenance. Do not
 * feed it back to models: even ordinary replies can quote earlier proactives.
 * The history remains available to the user in the existing UI/storage.
 * This is intentionally not a word/keyword filter or a timestamp allowlist.
 */
export function aiConversationHistory(_rows: readonly unknown[] | null | undefined): never[] {
  return [];
}

/** A declared import in a new prompt must not be reintroduced as manual data. */
export function declaresRestrictedActivityData(text: unknown): boolean {
  return typeof text === 'string' && /strava|strava\.com\/activities|strava_activity_id/i.test(text);
}

/** Map only canonical eligible metrics. No titles, notes, GPS or user payload. */
export function firstPartyRunFacts(row: Row | null | undefined): Row | null {
  if (!isFirstPartyActivity(row)) return null;
  const positive = (v: unknown): number | null => {
    if (typeof v !== 'number' && typeof v !== 'string') return null;
    if (typeof v === 'string' && !v.trim()) return null;
    const value = Number(v);
    return Number.isFinite(value) && value > 0 ? value : null;
  };
  const distance = positive(row!.distancia_km);
  const seconds = positive(row!.duracion_segundos);
  const rpe = positive(row!.rpe);
  return {
    id: typeof row!.id === 'string' ? row!.id : null,
    sport: ['running', 'cycling', 'trail', 'walking', 'carrera', 'bici', 'caminata'].includes(String(row!.deporte)) ? row!.deporte : null,
    distance_km: distance,
    duration_seconds: seconds,
    pace_seconds_per_km: distance !== null && seconds !== null ? Math.round(seconds / distance) : null,
    rpe: rpe !== null && rpe <= 10 ? rpe : null,
    created_at: typeof row!.created_at === 'string' && Number.isFinite(Date.parse(row!.created_at)) ? row!.created_at : null,
  };
}
