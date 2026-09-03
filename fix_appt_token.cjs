const fs = require('fs');
const file = 'src/pages/AppointmentsPage.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/requestId: appt\.requestId,/g, 'requestId: appt.tokenNumber,');

fs.writeFileSync(file, data);
