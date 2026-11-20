/**
 * Production Start Runner: Checks if React bundle is built before starting Treecraft server.
 */
const { spawnSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../');
const manifestPath = path.join(rootDir, 'site/public/react/manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.log('\x1b[33m%s\x1b[0m', '⚡ [Start] React bundle not found. Running build:react first...');
  const buildResult = spawnSync(
    'node',
    ['node_modules/vite/bin/vite.js', 'build', '--config', 'site/react/vite.config.ts'],
    { cwd: rootDir, stdio: 'inherit', shell: false }
  );

  if (buildResult.status !== 0) {
    console.error('\x1b[31m%s\x1b[0m', '❌ [Start] Failed to build React bundle. Exiting.');
    process.exit(1);
  }
}

console.log('\x1b[32m%s\x1b[0m', '✅ [Start] React bundle verified. Starting Treecraft CMS Server...');

const serverProcess = spawn(
  'node',
  ['core/bin/treecraft.js', 'start'],
  { cwd: rootDir, stdio: 'inherit', shell: false }
);

serverProcess.on('close', (code) => {
  process.exit(code || 0);
});
