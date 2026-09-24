import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const port = process.env.PORT || '3000';
const backendUrl =
  process.env.BACKEND_API_URL || 'http://api.railway.internal/api';
const wrangler = resolve('node_modules/wrangler/bin/wrangler.js');
const runtimeVariables = {
  BACKEND_API_URL: backendUrl,
  STUDENT_PORTAL_URL: process.env.STUDENT_PORTAL_URL,
  TEACHER_PORTAL_URL: process.env.TEACHER_PORTAL_URL,
};
const runtimeVariableArgs = Object.entries(runtimeVariables).flatMap(
  ([name, value]) => (value ? ['--var', `${name}:${value}`] : []),
);
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
    ...runtimeVariableArgs,
  ],
  { stdio: 'inherit' },
);

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
