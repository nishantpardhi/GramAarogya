const fs = require('fs');
const file = 'src/services/healthDataService.ts';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/isDemoMode: boolean,\s*/g, '');
data = data.replace(/isDemoData: (.*?),/g, '');
data = data.replace(/public static getEmergencyStatus\(isDemoMode: boolean,\s*/g, 'public static getEmergencyStatus(');

fs.writeFileSync(file, data);
