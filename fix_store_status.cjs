const fs = require('fs');
const file = 'server/db/store.ts';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/status: \(data\.status as any\) \|\| 'Confirmed',/g, "status: (data.status as any) || 'Pending',");

fs.writeFileSync(file, data);
