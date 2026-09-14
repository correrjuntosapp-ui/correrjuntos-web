import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SourceTextModule, SyntheticModule, createContext } from 'node:vm';
import test from 'node:test';

const source = readFileSync(new URL('../../api/cron/run.js', import.meta.url), 'utf8');
const cronConfig = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'));
const fakeEnv = { CRON_SECRET: 'test-only-cron-secret', SUPABASE_SERVICE_KEY: 'test-only-service', BREVO_API_KEY: 'test-only-mail' };

async function invoke({ job = 'lifecycle-trial', authenticated = true, token = false, env = fakeEnv, code = source } = {}) {
  const calls = [];
  const context = createContext({ process: { env }, console: { error() {} } });
  const module = new SourceTextModule(code, {
    context,
    importModuleDynamically: async (specifier) => {
      calls.push(specifier);
      const child = new SyntheticModule(['default'], function () {
        this.setExport('default', async (_req, res) => res.status(200).json({ forwarded: specifier }));
      }, { context });
      await child.link(() => { throw new Error('Unexpected nested import'); });
      await child.evaluate();
      return child;
    },
  });
  await module.link(() => { throw new Error('Unexpected static import'); });
  await module.evaluate();
  let status, body;
  const req = { query: { job, ...(token ? { token: fakeEnv.CRON_SECRET } : {}) }, headers: authenticated && !token ? { authorization: 'Bearer ' + fakeEnv.CRON_SECRET } : {} };
  const res = { status(value) { status = value; return this; }, json(value) { body = JSON.parse(JSON.stringify(value)); return this; } };
  await module.namespace.default(req, res);
  return { status, body, calls };
}

test('trial emails are paused before imports or provider/database access', async () => {
  for (const options of [{}, { env: { CRON_SECRET: fakeEnv.CRON_SECRET } }, { token: true }, { job: ['lifecycle-trial'] }]) {
    const result = await invoke(options);
    assert.equal(result.status, 200);
    assert.deepEqual(result.body, { ok: true, job: 'lifecycle-trial', paused: true, reason: 'consent_and_unsubscribe_review', processed: 0, sent: 0 });
    assert.deepEqual(result.calls, []);
  }
});

test('pause does not weaken authentication or change unknown-job handling', async () => {
  for (const job of ['lifecycle-trial', 'weekly-newsletter']) {
    const result = await invoke({ job, authenticated: false });
    assert.equal(result.status, 401); assert.deepEqual(result.calls, []);
  }
  assert.equal((await invoke({ env: {}, authenticated: true })).status, 401);
  assert.equal((await invoke({ job: 'not-a-job' })).status, 400);
  assert.equal((await invoke({ job: 'weekly-newsletter', env: { CRON_SECRET: fakeEnv.CRON_SECRET } })).status, 500);
});

test('every other job, including newsletter and pushes, still dispatches unchanged', async () => {
  const jobs = [...source.matchAll(/'([^']+)': \(\) => import\('([^']+)'\)/g)].map(match => ({ name: match[1], specifier: match[2] }));
  assert.equal(jobs.length, 15);
  for (const job of jobs.filter(job => job.name !== 'lifecycle-trial')) {
    const result = await invoke({ job: job.name });
    assert.equal(result.status, 200);
    assert.deepEqual(result.calls, [job.specifier]);
    assert.equal(result.body.forwarded, job.specifier);
  }
  assert.equal(cronConfig.crons.filter(cron => cron.path.endsWith('job=weekly-newsletter')).length, 2);
  assert.equal(cronConfig.crons.filter(cron => cron.path.endsWith('job=lifecycle-trial')).length, 1);
});

test('pause checks detect disabled pause and accidental newsletter pause', async () => {
  for (const replacement of ['false', "job === 'weekly-newsletter'"]) {
    const mutated = source.replace("job === 'lifecycle-trial'", replacement);
    assert.notEqual(mutated, source);
    const result = await invoke({ code: mutated });
    assert.notEqual(result.body.paused, true);
    assert.equal(result.calls.length, 1);
  }
});
