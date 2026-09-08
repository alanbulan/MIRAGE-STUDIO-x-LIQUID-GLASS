import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/proxy/[[path]].ts';

// All upstream traffic is mocked. No provider credentials or network are used.
let calls;
const originalFetch = globalThis.fetch;
beforeEach(() => {
  calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ data: [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  };
});
afterEach(() => { globalThis.fetch = originalFetch; });

function context(method = 'GET', env = {}, path = ['models'], body) {
  return {
    request: new Request('https://local.invalid/api/proxy/models', {
      method,
      ...(body === undefined ? {} : { body }),
    }),
    params: { path },
    env,
  };
}

for (const key of [undefined, '', '   ']) {
  test(`missing or blank secret fails closed (${JSON.stringify(key)})`, async () => {
    const response = await onRequest(context('GET', { CUSTOM_API_KEY: key }));
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.deepEqual(await response.json(), { error: 'CUSTOM_API_KEY is not configured' });
    assert.equal(calls.length, 0);
  });
}

test('OPTIONS keeps the preflight behavior without contacting upstream', async () => {
  const response = await onRequest(context('OPTIONS'));
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), '*');
  assert.equal(calls.length, 0);
});

test('unsupported method is rejected without contacting upstream', async () => {
  const response = await onRequest(context('DELETE'));
  assert.equal(response.status, 405);
  assert.equal(calls.length, 0);
});

test('configured GET uses only the provided trimmed secret', async () => {
  const response = await onRequest(context('GET', { CUSTOM_API_KEY: '  unit-test-only  ' }));
  assert.equal(response.status, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://chatgpt.alanbulan.space/v1/models');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer unit-test-only');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('configured POST preserves the JSON payload and path', async () => {
  const payload = { model: 'mock-model', prompt: 'offline test', n: 1 };
  const response = await onRequest(context('POST', { CUSTOM_API_KEY: 'unit-test-only' },
    ['images', 'generations'], JSON.stringify(payload)));
  assert.equal(response.status, 200);
  assert.equal(calls[0].url, 'https://chatgpt.alanbulan.space/v1/images/generations');
  assert.deepEqual(JSON.parse(calls[0].init.body), payload);
});

test('upstream error status is forwarded, not converted into success', async () => {
  globalThis.fetch = async () => new Response('{"error":"mock quota"}', {
    status: 429, headers: { 'Content-Type': 'application/json' },
  });
  const response = await onRequest(context('GET', { CUSTOM_API_KEY: 'unit-test-only' }, 'models'));
  assert.equal(response.status, 429);
  assert.equal((await response.json()).error, 'mock quota');
});

test('invalid JSON does not send an upstream request', async () => {
  const response = await onRequest(context('POST', { CUSTOM_API_KEY: 'unit-test-only' }, 'models', '{'));
  assert.equal(response.status, 500); // Existing parse-error behavior is unchanged.
  assert.equal(calls.length, 0);
});
