import assert from 'node:assert/strict';
import { validateEnv, maskSecrets } from './env-validator.ts';

const schema = {
  PORT: { type: 'port', default: 3000 },
  DEBUG: { type: 'boolean', default: false },
  API_KEY: { type: 'string', required: true, secret: true },
  ENV: { type: 'enum', choices: ['dev', 'prod'] },
  API_URL: { type: 'url' },
};

// Test 1: Valid inputs & defaults
{
  const result = validateEnv({ API_KEY: 'secret123456' }, schema);
  assert.equal(result.valid, true);
  assert.equal(result.data.PORT, 3000);
  assert.equal(result.data.DEBUG, false);
  assert.equal(result.data.API_KEY, 'secret123456');
}

// Test 2: Type parsing & conversions
{
  const result = validateEnv(
    {
      PORT: '8080',
      DEBUG: '1',
      API_KEY: 'key',
      ENV: 'prod',
      API_URL: 'https://api.example.com/v1',
    },
    schema
  );
  assert.equal(result.valid, true);
  assert.equal(result.data.PORT, 8080);
  assert.equal(result.data.DEBUG, true);
  assert.equal(result.data.ENV, 'prod');
  assert.equal(result.data.API_URL, 'https://api.example.com/v1');
}

// Test 3: Validation errors
{
  const result = validateEnv(
    {
      PORT: '99999',
      DEBUG: 'maybe',
      ENV: 'staging',
      API_URL: 'not-a-url',
    },
    schema
  );
  assert.equal(result.valid, false);
  assert.ok(result.errors.API_KEY);
  assert.ok(result.errors.PORT);
  assert.ok(result.errors.DEBUG);
  assert.ok(result.errors.ENV);
  assert.ok(result.errors.API_URL);
}

// Test 4: Masking secrets
{
  const masked = maskSecrets({ API_KEY: 'sk-super-secret-key-1234', PORT: 3000 }, schema);
  assert.equal(masked.PORT, 3000);
  assert.equal(masked.API_KEY, 'sk***34');
}

console.log('env-validator: 4 tests passed');
