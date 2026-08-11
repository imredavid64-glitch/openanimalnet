// Detached launcher for the preview server: spawns `next start` (or `next dev`
// with `node .freebuff/start-preview.js dev`) in its own session so it
// outlives the tool call that starts it.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Optional third arg overrides the project root (used when serving a build
// produced in a scratch tree, e.g. /tmp/oan-fresh).
const root = process.argv[3] || '/Users/imredavid/Documents/OpenAnimalNet';
const logPath = '/Users/imredavid/Documents/OpenAnimalNet/.freebuff/preview-69ae7c02-c946-46d3-8068-db480452b398.log';
const out = fs.openSync(logPath, 'a');
const err = fs.openSync(logPath, 'a');

// Spawn node directly against the Next CLI entrypoint: exec'ing the
// `node_modules/.bin/next` shell wrapper can hang for minutes when the
// antivirus scanner blocks reads of it.
const mode = process.argv[2] === 'dev' ? 'dev' : 'start';
const nextCli = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
const child = spawn(process.execPath, [nextCli, mode, '-p', '3100'], {
  cwd: root,
  detached: true,
  stdio: ['ignore', out, err],
  env: { ...process.env },
});
child.unref();
console.log('PREVIEW_PID=' + child.pid);
