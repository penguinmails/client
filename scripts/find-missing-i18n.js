const fs = require('fs');
const path = require('path');

function getMessage(obj, key) {
  return key.split('.').reduce((acc, part) => {
    if (acc === undefined || acc === null) return undefined;
    return acc[part];
  }, obj);
}

const keyLocations = {};
function collectTranslationKeys(dir, ext = /\.(ts|tsx|js|jsx)$/i) {
  const keys = new Set();

  function walk(dirPath) {
    for (const name of fs.readdirSync(dirPath)) {
      const full = path.join(dirPath, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        if (name === 'node_modules' || name === '.next' || name === '.git') continue;
        walk(full);
      } else if (ext.test(name)) {
        const content = fs.readFileSync(full, 'utf8');
        const regex = /t\(\s*["'`]([^"'`]+)["'`]\s*(?:,|\))/g;
        let m;
        while ((m = regex.exec(content)) !== null) {
          const k = m[1];
          keys.add(k);
          if (!keyLocations[k]) keyLocations[k] = new Set();
          keyLocations[k].add(full);
        }
      }
    }
  }

  walk(dir);
  return Array.from(keys);
}

const messages = JSON.parse(fs.readFileSync(path.resolve(__dirname,'../messages/en.json'),'utf8'));
const keys = collectTranslationKeys(path.resolve(__dirname,'..'));
const i18nKeyRegex = /^[A-Z][A-Za-z0-9_\-\/]*(?:\.[A-Za-z0-9_\-\/]*)+$/;

const missing = [];
for (const key of keys) {
  if (!i18nKeyRegex.test(key)) continue;
  if (key.includes('${')) continue;
  const val = getMessage(messages, key);
  if (val === undefined) missing.push(key);
}

console.log('Found', missing.length, 'missing keys');
console.log(missing.slice(0, 50).join('\n'));

for (const k of missing) {
  console.log('\nLocations for:', k);
  for (const f of keyLocations[k] || []) console.log('  ', f);
}
