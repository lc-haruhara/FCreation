import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function parseEnvFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const entries = [];

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    if (!key) continue;

    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    entries.push([key, value]);
  }

  return entries;
}

function loadEnvFiles(mode) {
  const cwd = process.cwd();
  const originalEnv = new Map(Object.entries(process.env));
  const envFiles = ['.env', '.env.local', `.env.${mode}`, `.env.${mode}.local`];

  for (const fileName of envFiles) {
    const filePath = path.join(cwd, fileName);
    if (!existsSync(filePath)) continue;

    for (const [key, value] of parseEnvFile(filePath)) {
      process.env[key] = value;
    }
  }

  for (const [key, value] of originalEnv) {
    process.env[key] = value;
  }
}

const [, , mode, command, ...args] = process.argv;

if (!mode || !command) {
  console.error('Usage: node scripts/run-with-env.mjs <mode> <command> [...args]');
  process.exit(1);
}

loadEnvFiles(mode);

const child = spawn(command, args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
