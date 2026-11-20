/**
 * Dev Runner: Runs Treecraft Core Server and React Vite Watcher in parallel (DEC-057)
 * Built with pure Node.js (no extra npm packages required).
 * Invokes node directly without shell: true to avoid space escaping issues on Windows.
 */
const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../');
const isWin = process.platform === 'win32';

console.log('\x1b[36m%s\x1b[0m', '🚀 [Dev Runner] Starting Treecraft Server & Vite React Watcher...');

// 1. Start Treecraft CMS Server
const coreProcess = spawn(
  'node',
  ['core/bin/treecraft.js', 'dev'],
  {
    cwd: rootDir,
    stdio: 'inherit',
    shell: false,
  }
);

// 2. Start Vite React Build in Watch Mode via direct Node invocation
const viteScript = 'node_modules/vite/bin/vite.js';
const viteProcess = spawn(
  'node',
  [viteScript, 'build', '--watch', '--config', 'site/react/vite.config.ts'],
  {
    cwd: rootDir,
    stdio: 'inherit',
    shell: false,
  }
);

function cleanup() {
  console.log('\n\x1b[33m%s\x1b[0m', '🛑 [Dev Runner] Stopping processes...');
  try {
    if (coreProcess && !coreProcess.killed) {
      if (isWin && coreProcess.pid) {
        spawn('taskkill', ['/pid', String(coreProcess.pid), '/f', '/t'], { stdio: 'ignore' });
      } else {
        coreProcess.kill('SIGTERM');
      }
    }
  } catch (e) {}

  try {
    if (viteProcess && !viteProcess.killed) {
      if (isWin && viteProcess.pid) {
        spawn('taskkill', ['/pid', String(viteProcess.pid), '/f', '/t'], { stdio: 'ignore' });
      } else {
        viteProcess.kill('SIGTERM');
      }
    }
  } catch (e) {}

  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

coreProcess.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`[Treecraft] Core process exited with code ${code}`);
  }
});

viteProcess.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`[Vite] Watcher process exited with code ${code}`);
  }
});
