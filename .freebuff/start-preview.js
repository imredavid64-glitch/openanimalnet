// Detached launcher for the preview server: spawns `next start` (or `next dev`
// with `node .freebuff/start-preview.js dev`) in its own session so it
// outlives the tool call that starts it.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Optional third arg overrides the project root (used when serving a build
// produced in a scratch tree, e.g. /tmp/oan-fresh).
const root = process.argv[3] || '/Users/imredavid/Documents/OpenAnimalNet';
// Logs land in .freebuff/logs/ (gitignored) so they never accumulate at the
// repo root. The dir is created on first launch. Each session gets its own
// timestamped log (e.g. preview-2026-08-16T12-34-56-789Z.log) so old sessions
// are naturally separated instead of appending to one file forever.
const logDir = path.join(__dirname, 'logs');
fs.mkdirSync(logDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const logPath = path.join(logDir, `preview-${stamp}.log`);
const out = fs.openSync(logPath, 'w');
const err = fs.openSync(logPath, 'w');

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

// Session header at the top of the log. Written synchronously right after
// spawn — the child's output only streams in on later event-loop ticks, so
// the header reliably lands before any of it.
fs.writeSync(
  out,
  [
    `# Preview session — ${new Date().toISOString()}`,
    `# mode: ${mode}`,
    `# root: ${root}`,
    `# pid:  ${child.pid}`,
    '',
  ].join('\n')
);
console.log('PREVIEW_PID=' + child.pid);
