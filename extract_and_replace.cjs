const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'src/locales/en.ts');
const mrPath = path.join(__dirname, 'src/locales/mr.ts');
const hiPath = path.join(__dirname, 'src/locales/hi.ts');

let enContent = fs.readFileSync(enPath, 'utf8');
let mrContent = fs.readFileSync(mrPath, 'utf8');
let hiContent = fs.readFileSync(hiPath, 'utf8');

let counter = 1000;

function appendToLocale(content, key, value) {
  // Add before the last closing brace
  const lastBraceIndex = content.lastIndexOf('}');
  if (lastBraceIndex !== -1) {
    const escapedValue = value.replace(/'/g, "\\'");
    const newEntry = `\n  '${key}': '${escapedValue}',\n`;
    return content.slice(0, lastBraceIndex) + newEntry + content.slice(lastBraceIndex);
  }
  return content;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Pattern 1: language === 'mr' ? 'mrStr' : language === 'hi' ? 'hiStr' : 'enStr'
  const pattern1 = /language\s*===\s*['"]mr['"]\s*\?\s*['"]([^'"]+)['"]\s*:\s*language\s*===\s*['"]hi['"]\s*\?\s*['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g;
  content = content.replace(pattern1, (match, mrStr, hiStr, enStr) => {
    const key = `auto.text_${counter++}`;
    enContent = appendToLocale(enContent, key, enStr);
    mrContent = appendToLocale(mrContent, key, mrStr);
    hiContent = appendToLocale(hiContent, key, hiStr);
    changed = true;
    return `t('${key}')`;
  });

  // Pattern 2: language === 'hi' ? 'hiStr' : language === 'mr' ? 'mrStr' : 'enStr'
  const pattern2 = /language\s*===\s*['"]hi['"]\s*\?\s*['"]([^'"]+)['"]\s*:\s*language\s*===\s*['"]mr['"]\s*\?\s*['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g;
  content = content.replace(pattern2, (match, hiStr, mrStr, enStr) => {
    const key = `auto.text_${counter++}`;
    enContent = appendToLocale(enContent, key, enStr);
    mrContent = appendToLocale(mrContent, key, mrStr);
    hiContent = appendToLocale(hiContent, key, hiStr);
    changed = true;
    return `t('${key}')`;
  });

  // Pattern 3: language === 'mr' ? 'mrStr' : 'enStr'
  const pattern3 = /language\s*===\s*['"]mr['"]\s*\?\s*['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g;
  content = content.replace(pattern3, (match, mrStr, enStr) => {
    const key = `auto.text_${counter++}`;
    enContent = appendToLocale(enContent, key, enStr);
    mrContent = appendToLocale(mrContent, key, mrStr);
    hiContent = appendToLocale(hiContent, key, enStr); // fallback hi to en
    changed = true;
    return `t('${key}')`;
  });

  // Pattern 4: language === 'mr' ? `mrStr` : `enStr` (backticks without variables)
  const pattern4 = /language\s*===\s*['"]mr['"]\s*\?\s*`([^`${}]+)`\s*:\s*`([^`${}]+)`/g;
  content = content.replace(pattern4, (match, mrStr, enStr) => {
    const key = `auto.text_${counter++}`;
    enContent = appendToLocale(enContent, key, enStr);
    mrContent = appendToLocale(mrContent, key, mrStr);
    hiContent = appendToLocale(hiContent, key, enStr);
    changed = true;
    return `t('${key}')`;
  });

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
      if (!fullPath.includes('locales') && !fullPath.includes('data/maharashtraData')) {
        processFile(fullPath);
      }
    }
  }
}

walk(path.join(__dirname, 'src'));

fs.writeFileSync(enPath, enContent);
fs.writeFileSync(mrPath, mrContent);
fs.writeFileSync(hiPath, hiContent);

console.log('Done mapping keys.');
