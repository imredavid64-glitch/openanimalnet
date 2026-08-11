// Detached launcher for `next build --no-lint`: spawns in its own session so
// it outlives the tool call that starts it.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = '/Users/imredavid/Documents/OpenAnimalNet';
const logPath = '/tmp/build-final.log';
const out = fs.openSync(logPath, 'a');
const err = fs.openSync(logPath, 'a');

// Spawn node directly against the Next CLI entrypoint: exec'ing the
// `node_modules/.bin/next` shell wrapper can hang for minutes when the
// antivirus scanner blocks reads of it.
const nextCli = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
const child = spawn(process.execPath, [nextCli, 'build', '--no-lint'], {
  cwd: root,
  detached: true,
  stdio: ['ignore', out, err],
  env: { ...process.env },
});
child.unref();
console.log('BUILD_PID=' + child.pid);
