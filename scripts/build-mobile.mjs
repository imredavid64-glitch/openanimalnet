// Builds the Capacitor webDir ('out/') for the mobile app.
//
// The app is a Next.js server app with live API routes, so a fully static
// `next export` is not possible. The mobile WebView loads the hosted app via
// `server.url` in capacitor.config.js, so 'out/' only needs to be a valid
// web bundle for `npx cap sync` to copy into the native projects. It contains
// a redirect shell (used while the WebView boots / offline) plus all static
// assets from /public.
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'out');
const publicDir = path.join(root, 'public');

const APP_URL = 'https://openanimalnet.vercel.app';

console.log('🏗  Building web app (validation + app shell)...');
execFileSync(process.execPath, [path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next'), 'build'], {
  cwd: root,
  stdio: 'inherit',
});

console.log('📦 Assembling Capacitor webDir (out/)...');
mkdirSync(outDir, { recursive: true });

const shell = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#0ea5e9" />
  <title>OpenAnimalNet</title>
  <link rel="icon" href="/favicon.svg" />
  <meta http-equiv="refresh" content="0; url=${APP_URL}" />
  <style>
    html, body { margin: 0; height: 100%; }
    body {
      display: flex; align-items: center; justify-content: center; flex-direction: column;
      font-family: system-ui, sans-serif; color: #334155; background: linear-gradient(135deg, #0369a1, #1e3a8a);
    }
    .card {
      background: #fff; border-radius: 16px; padding: 32px 40px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,.25);
    }
    .card h1 { margin: 0 0 8px; font-size: 20px; }
    .card p { margin: 0 0 16px; font-size: 14px; color: #64748b; }
    .card a { display: inline-block; padding: 10px 20px; border-radius: 10px; background: #0284c7; color: #fff; text-decoration: none; font-size: 14px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🐾 OpenAnimalNet</h1>
    <p>Loading the wildlife conservation platform…</p>
    <a href="${APP_URL}">Open App</a>
  </div>
</body>
</html>
`;

writeFileSync(path.join(outDir, 'index.html'), shell);
cpSync(publicDir, outDir, { recursive: true });

console.log(`✅ out/ ready at ${outDir}`);