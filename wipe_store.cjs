const fs = require('fs');
const file = 'server/db/store.ts';
let data = fs.readFileSync(file, 'utf8');

// Use regex to empty out the arrays in seedVerifiedData
data = data.replace(/this\.facilities = \[[\s\S]*?\];/, 'this.facilities = [];');
data = data.replace(/this\.doctors = \[[\s\S]*?\];/, 'this.doctors = [];');
// Don't need to wipe health camps or schemes unless requested, but just to be safe.

fs.writeFileSync(file, data);
console.log('Wiped store seeded data');
