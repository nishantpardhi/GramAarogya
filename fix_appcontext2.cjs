const fs = require('fs');
const file = 'src/context/AppContext.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/\bisDemoMode: boolean;\s*/g, '');
data = data.replace(/setIsDemoMode: \(val: boolean \| \(\(prev: boolean\) => boolean\)\) => void;\s*/g, '');
data = data.replace(/const \[isDemoMode, setIsDemoModeState\] = useState<boolean>[\s\S]*?\(\) => \{\s*const saved = localStorage\.getItem\('gramarogya_demomode'\);\s*return saved === 'true';\s*\}\);\s*/g, '');
data = data.replace(/useEffect\(\(\) => \{\s*localStorage\.setItem\('gramarogya_demomode', String\(isDemoMode\)\);\s*apiClient\.setDataMode\(!isDemoMode\);\s*\}, \[isDemoMode\]\);\s*/g, '');
data = data.replace(/const setIsDemoMode = \(val: boolean \| \(\(prev: boolean\) => boolean\)\) => \{\s*setIsDemoModeState\(val\);\s*\};\s*/g, '');
data = data.replace(/\bisDemoMode,\s*/g, '');
data = data.replace(/\bsetIsDemoMode,\s*/g, '');

fs.writeFileSync(file, data);
