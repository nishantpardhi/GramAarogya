const fs = require('fs');
const file = 'src/context/AppContext.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/\bdataSourceLabel: string;\s*/g, '');
data = data.replace(/\blastDataSync: string;\s*/g, '');
data = data.replace(/const \[dataSourceLabel, setDataSourceLabel\] = useState<string>\(.*\);\s*/g, '');
data = data.replace(/const \[lastDataSync, setLastDataSync\] = useState<string>\(.*\);\s*/g, '');
data = data.replace(/if \(facRes\.source\) setDataSourceLabel\(facRes\.source\);\s*/g, '');
data = data.replace(/setLastDataSync\(new Date\(\)\.toLocaleTimeString\(.*?\)\);\s*/g, '');
data = data.replace(/\bdataSourceLabel,\s*/g, '');
data = data.replace(/\blastDataSync,\s*/g, '');

fs.writeFileSync(file, data);
