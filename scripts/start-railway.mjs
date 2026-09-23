import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const port = process.env.PORT || '3000';
const backendUrl =
  process.env.BACKEND_API_URL || 'http://api.railway.internal/api';
const wrangler = resolve('node_modules/wrangler/bin/wrangler.js');
const child = spawn(
  process.execPath,
  [
    wrangler,
    'dev',
    '--config',
    'dist/server/wrangler.json',
    '--ip',
    '0.0.0.0',
    '--port',
    port,
    '--var',
    `BACKEND_API_URL:${backendUrl}`,
  ],
  { stdio: 'inherit' },
);

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
