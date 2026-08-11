// Detached launcher for the preview server: spawns `next start` in its own
// session so it outlives the tool call that starts it.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = '/Users/imredavid/Documents/OpenAnimalNet';
const logPath = path.join(root, '.freebuff', 'preview-69ae7c02-c946-46d3-8068-db480452b398.log');
const out = fs.openSync(logPath, 'a');
const err = fs.openSync(logPath, 'a');

// Spawn node directly against the Next CLI entrypoint: exec'ing the
// `node_modules/.bin/next` shell wrapper can hang for minutes when the
// antivirus scanner blocks reads of it.
const nextCli = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
const child = spawn(process.execPath, [nextCli, 'start', '-p', '3100'], {
  cwd: root,
  detached: true,
  stdio: ['ignore', out, err],
  env: { ...process.env },
});
child.unref();
console.log('PREVIEW_PID=' + child.pid);
