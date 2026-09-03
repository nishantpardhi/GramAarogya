const fs = require('fs');
const file = 'src/pages/FacilitiesPage.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  /'Real-time interactive OpenStreetMap GIS tracking of emergency doctors, vacant beds, anti-snake venom stock, and distances\.'/g,
  "'Find nearby healthcare facilities, available services, and directions to government hospitals and primary health centres.'"
);

fs.writeFileSync(file, data);
