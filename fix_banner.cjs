const fs = require('fs');
const file = 'src/components/DataSourceBanner.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/isDemoData\?: boolean;\s*/g, '');
data = data.replace(/isDemoData,\s*/g, '');

fs.writeFileSync(file, data);
console.log('Fixed DataSourceBanner');
