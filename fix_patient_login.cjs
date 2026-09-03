const fs = require('fs');
const file = 'src/components/auth/PatientLoginView.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/<div className="pt-1\.5 border-t border-slate-200\/60 dark:border-slate-700\/60 flex items-center justify-between">[\s\S]*?<\/div>/, '');

fs.writeFileSync(file, data);
