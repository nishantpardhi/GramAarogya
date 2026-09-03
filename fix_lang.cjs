const fs = require('fs');
const path = require('path');

// Read locales
const enPath = path.join(__dirname, 'src/locales/en.ts');
const mrPath = path.join(__dirname, 'src/locales/mr.ts');
const hiPath = path.join(__dirname, 'src/locales/hi.ts');

function extractDict(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Hacky regex to extract key-values from the locale files
  const dict = {};
  const lines = content.split('\n');
  for (let line of lines) {
    const match = line.match(/^\s*(?:'([^']+)'|([a-zA-Z0-9_]+))\s*:\s*(['"`])(.*)\3\s*,?$/);
    if (match) {
      const key = match[1] || match[2];
      const val = match[4];
      dict[key] = val;
    }
  }
  return dict;
}

const enDict = extractDict(enPath);
const mrDict = extractDict(mrPath);
const hiDict = extractDict(hiPath);

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const [key, enVal] of Object.entries(enDict)) {
    const mrVal = mrDict[key];
    const hiVal = hiDict[key];

    if (!enVal || !mrVal) continue;

    const mrRegexStr = `language\\s*===\\s*['"\`]mr['"\`]\\s*\\?\\s*['"\`]${escapeRegExp(mrVal)}['"\`]`;
    const hiRegexStr = hiVal ? `\\s*:\\s*language\\s*===\\s*['"\`]hi['"\`]\\s*\\?\\s*['"\`]${escapeRegExp(hiVal)}['"\`]` : `(?:\\s*:\\s*language\\s*===\\s*['"\`]hi['"\`]\\s*\\?\\s*['"\`].*?['"\`])?`;
    const enRegexStr = `\\s*:\\s*['"\`]${escapeRegExp(enVal)}['"\`]`;

    // language === 'mr' ? 'mrVal' : language === 'hi' ? 'hiVal' : 'enVal'
    const fullRegexStr = mrRegexStr + hiRegexStr + enRegexStr;
    const regex = new RegExp(fullRegexStr, 'g');

    if (regex.test(content)) {
      content = content.replace(regex, `t('${key}')`);
      changed = true;
    }
    
    // Also try swapping mr and hi in the ternary (some places might have language === 'hi' first)
    if (hiVal) {
      const hiFirstStr = `language\\s*===\\s*['"\`]hi['"\`]\\s*\\?\\s*['"\`]${escapeRegExp(hiVal)}['"\`]\\s*:\\s*language\\s*===\\s*['"\`]mr['"\`]\\s*\\?\\s*['"\`]${escapeRegExp(mrVal)}['"\`]\\s*:\\s*['"\`]${escapeRegExp(enVal)}['"\`]`;
      const regexHiFirst = new RegExp(hiFirstStr, 'g');
      if (regexHiFirst.test(content)) {
        content = content.replace(regexHiFirst, `t('${key}')`);
        changed = true;
      }
    }
  }

  // Fallback for cases where it's wrapped in {} inside JSX
  // e.g. {language === 'mr' ? 'mrVal' : 'enVal'}  -> {t('key')}
  // But wait, the replacement `t('key')` works well because inside {} it evaluates correctly!

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Updated:', filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (let file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      if (!fullPath.includes('locales')) {
        processFile(fullPath);
      }
    }
  }
}

walk(path.join(__dirname, 'src'));
console.log('Done.');
