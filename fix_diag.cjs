const fs = require('fs');
const file = 'src/pages/ApiDiagnosticsPage.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/isDemoMode, setIsDemoMode,/g, '');
data = data.replace(/isDemoMode/g, 'false');
data = data.replace(/setIsDemoMode\(false\);/g, '');
data = data.replace(/setIsDemoMode\(true\);/g, '');
// Better yet, just remove the entire demo mode block if possible, but let's just make sure it compiles.
fs.writeFileSync(file, data);
