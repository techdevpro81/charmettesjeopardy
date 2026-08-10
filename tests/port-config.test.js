import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const serverSource = readFileSync(join(root, 'server.js'), 'utf8');
const socketSource = readFileSync(join(root, 'src/socket.js'), 'utf8');

test('browser socket and server use the same port', () => {
  const serverMatch = serverSource.match(/PORT\s*=\s*process\.env\.PORT\s*\|\|\s*(\d+)/);
  const clientMatch = socketSource.match(/const\s+port\s*=\s*(\d+)/);

  assert.ok(serverMatch, 'Server port config not found.');
  assert.ok(clientMatch, 'Client socket port config not found.');
  assert.equal(Number(clientMatch[1]), Number(serverMatch[1]), 'Server and client ports must match.');
});
