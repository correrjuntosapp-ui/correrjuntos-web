import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyStravaActivity, mapDeporte } from '../../api/_lib/strava-activity-types.js';

const cases = {
  Run: ['endurance', 'running'], VirtualRun: ['endurance', 'running'], TrailRun: ['endurance', 'trail'],
  Walk: ['endurance', 'walking'], Hike: ['endurance', 'walking'],
  Ride: ['endurance', 'bici'], VirtualRide: ['endurance', 'bici'], GravelRide: ['endurance', 'bici'],
  MountainBikeRide: ['endurance', 'bici'], EBikeRide: ['endurance', 'bici'],
  EMountainBikeRide: ['endurance', 'bici'], Handcycle: ['endurance', 'bici'], Velomobile: ['endurance', 'bici'],
  WeightTraining: ['strength', null], Workout: ['strength', null], Crossfit: ['strength', null],
  HighIntensityIntervalTraining: ['strength', null],
};

for (const [sport, [kind, mapped]] of Object.entries(cases)) {
  test(`clasifica ${sport}`, () => {
    assert.equal(classifyStravaActivity({ sport_type: sport }), kind);
    if (mapped) assert.equal(mapDeporte({ sport_type: sport }), mapped);
  });
}

test('sport_type tiene prioridad sobre type', () => {
  assert.equal(classifyStravaActivity({ sport_type: 'TrailRun', type: 'Run' }), 'endurance');
  assert.equal(mapDeporte({ sport_type: 'TrailRun', type: 'Run' }), 'trail');
});

test('no convierte deportes ajenos en carrera', () => {
  for (const sport of ['Swim', 'Yoga', 'Pilates', 'Soccer', '']) {
    assert.equal(classifyStravaActivity({ sport_type: sport }), null);
  }
});
