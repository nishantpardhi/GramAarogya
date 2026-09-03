const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Check if it has t(
  if (content.includes('t(')) {
    // find `useApp()` destructuring
    const useAppRegex = /const\s+\{([^}]+)\}\s*=\s*useApp\(\);/g;
    content = content.replace(useAppRegex, (match, vars) => {
      if (!vars.split(',').map(v => v.trim()).includes('t')) {
        changed = true;
        return `const { t, ${vars.trim()} } = useApp();`;
      }
      return match;
    });
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Injected t into useApp() for:', filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (let file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walk(path.join(__dirname, 'src'));
console.log('Done injecting t');
