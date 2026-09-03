const fs = require('fs');
const file = 'src/pages/PatientDashboardPage.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/import \{ LocationModal \} from '\.\.\/components\/LocationModal';\n/g, '');

fs.writeFileSync(file, data);
