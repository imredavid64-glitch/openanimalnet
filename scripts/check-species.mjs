import fs from 'fs';

const content = fs.readFileSync('src/data/sample/animals.ts', 'utf8');
const ids = ['philippine-eagle-001','harpy-eagle-001','golden-poison-frog-001','chinese-giant-salamander-001','elkhorn-coral-001','staghorn-coral-001','lord-howe-tree-lobster-001','rusty-patched-bumble-bee-001','whale-shark-001'];

for (const id of ids) {
  const start = content.indexOf('id: "' + id + '"');
  if (start === -1) { console.log(id + ': NOT FOUND'); continue; }
  let braceCount = 0;
  let end = -1;
  for (let i = start; i < content.length; i++) {
    if (content[i] === '{') braceCount++;
    else if (content[i] === '}') { braceCount--; if (braceCount === 0) { end = i + 1; break; } }
  }
  if (end === -1) { console.log(id + ': NO END'); continue; }
  const block = content.slice(start, end);
  const hasHistory = block.includes('populationHistory:');
  console.log(id + ': has populationHistory = ' + hasHistory);
}