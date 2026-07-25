import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config();

const rootDir = process.cwd();
const pgliteServerBin = path.join(rootDir, 'node_modules', '@electric-sql', 'pglite-socket', 'dist', 'scripts', 'server.js');
const drizzleBin = path.join(rootDir, 'node_modules', 'drizzle-kit', 'bin.cjs');
const nextBin = path.join(rootDir, 'node_modules', 'next', 'dist', 'bin', 'next');

const env = { ...process.env };
const children = [];

function startProcess(command, args, extraEnv = {}) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    env: { ...env, ...extraEnv },
  });

  children.push(child);
  child.on('exit', (code, signal) => {
    if (signal) {
      process.exitCode = 1;
    } else if (code && code !== 0) {
      process.exitCode = code;
    }
  });

  return child;
}

function waitForExit(child, label) {
  return new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`${label} exited with signal ${signal}`));
        return;
      }

      if (code && code !== 0) {
        reject(new Error(`${label} exited with code ${code}`));
        return;
      }

      resolve(undefined);
    });
  });
}

function waitForPort(host, port, timeoutMs = 15000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    function tryConnect() {
      const socket = net.connect({ host, port });

      socket.once('connect', () => {
        socket.end();
        resolve(undefined);
      });

      socket.once('error', () => {
        socket.destroy();

        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Timed out waiting for ${host}:${port}`));
          return;
        }

        setTimeout(tryConnect, 250);
      });
    }

    tryConnect();
  });
}

async function main() {
  const dbServer = startProcess(process.execPath, [pgliteServerBin, '-m', '100']);

  const databaseUrl = new URL(env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:5432/postgres');
  await waitForPort(databaseUrl.hostname, Number(databaseUrl.port || 5432));

  const migrate = spawn(process.execPath, [drizzleBin, 'migrate'], {
    stdio: 'inherit',
    env,
  });

  await waitForExit(migrate, 'drizzle-kit migrate');

  const nextDev = startProcess(process.execPath, [nextBin, 'dev']);

  const shutdown = () => {
    for (const child of children) {
      if (!child.killed) {
        child.kill('SIGTERM');
      }
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  await Promise.race([
    waitForExit(dbServer, 'pglite-server'),
    waitForExit(nextDev, 'next dev'),
  ]);

  shutdown();
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
