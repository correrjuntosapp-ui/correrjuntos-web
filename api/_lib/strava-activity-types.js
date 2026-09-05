export const RUN_TYPES = new Set(['Run', 'VirtualRun']);
export const TRAIL_TYPES = new Set(['TrailRun']);
export const WALK_TYPES = new Set(['Walk', 'Hike']);
export const BIKE_TYPES = new Set([
  'Ride', 'VirtualRide', 'GravelRide', 'MountainBikeRide',
  'EBikeRide', 'EMountainBikeRide', 'Handcycle', 'Velomobile',
]);
export const STRENGTH_TYPES = new Set([
  'WeightTraining', 'Workout', 'Crossfit', 'HighIntensityIntervalTraining',
]);

export function sportType(activity) {
  return activity?.sport_type || activity?.type || '';
}

export function classifyStravaActivity(activity) {
  const sport = sportType(activity);
  if (RUN_TYPES.has(sport) || TRAIL_TYPES.has(sport) || WALK_TYPES.has(sport) || BIKE_TYPES.has(sport)) {
    return 'endurance';
  }
  if (STRENGTH_TYPES.has(sport)) return 'strength';
  return null;
}

export function mapDeporte(activity) {
  const sport = sportType(activity);
  if (TRAIL_TYPES.has(sport)) return 'trail';
  if (WALK_TYPES.has(sport)) return 'walking';
  if (BIKE_TYPES.has(sport)) return 'bici';
  return 'running';
}
