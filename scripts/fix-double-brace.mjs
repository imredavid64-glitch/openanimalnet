#!/usr/bin/env node
/**
 * Fix the double-brace issue in the 9 species.
 */

import fs from 'fs';
import path from 'path';

const DATA_FILE = path.resolve('src/data/sample/animals.ts');

async function main() {
  let content = fs.readFileSync(DATA_FILE, 'utf8');

  // Fix the double-brace issue: "  {\n    {" -> "  {"
  content = content.replace(/  \{\s*\n\s*\{/g, '  {');

  // Also fix any trailing comma issues in the populationHistory array
  content = content.replace(/(\s+estimate: \d+),\s*},/g, '$1\n    },');

  fs.writeFileSync(DATA_FILE, content);
  console.log('✅ Fixed double-brace issue');
}

main().catch(e => { console.error(e); process.exit(1); });