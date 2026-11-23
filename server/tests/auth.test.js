// Unit tests for the authentication / authorisation middleware and JWT helper.
// No database is needed: these cases fail before the user lookup.
import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret-for-unit-tests';
const { protect, requireRole } = await import('../src/middleware/auth.js');
const { generateToken } = await import('../src/utils/generateToken.js');

describe('requireRole', () => {
  test('lets a manager through to a manager-only route', () => {
    let called = false;
    requireRole('manager')({ user: { role: 'manager' } }, {}, () => { called = true; });
    assert.equal(called, true);
  });

  test('blocks a bartender from a manager-only route with 403', () => {
    let called = false;
    assert.throws(
      () => requireRole('manager')({ user: { role: 'bartender' } }, {}, () => { called = true; }),
      (err) => err.status === 403 && /permission/.test(err.message),
    );
    assert.equal(called, false);
  });

  test('allows any of several roles', () => {
    let called = false;
    requireRole('manager', 'bartender')({ user: { role: 'bartender' } }, {}, () => { called = true; });
    assert.equal(called, true);
  });
});

describe('protect', () => {
  test('rejects a request with no Authorization header (401)', async () => {
    await assert.rejects(protect({ headers: {} }, {}, () => {}), (err) => err.status === 401);
  });

  test('rejects a header that is not a Bearer token (401)', async () => {
    await assert.rejects(protect({ headers: { authorization: 'Basic abc' } }, {}, () => {}), (err) => err.status === 401);
  });

  test('rejects a token signed with a different secret (401)', async () => {
    const forged = jwt.sign({ id: '123', role: 'manager' }, 'someone-elses-secret');
    await assert.rejects(
      protect({ headers: { authorization: `Bearer ${forged}` } }, {}, () => {}),
      (err) => err.status === 401 && /invalid/.test(err.message),
    );
  });
});

describe('generateToken', () => {
  let token;
  before(() => { token = generateToken({ _id: 'abc123', role: 'manager' }); });

  test('creates a token that verifies with the server secret', () => {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    assert.equal(payload.id, 'abc123');
    assert.equal(payload.role, 'manager');
  });

  test('never puts the password in the token', () => {
    const payload = jwt.decode(generateToken({ _id: 'x', role: 'bartender', password: 'secret' }));
    assert.equal('password' in payload, false);
  });

  test('sets an expiry time', () => {
    assert.ok(jwt.decode(token).exp > Math.floor(Date.now() / 1000));
  });
});
