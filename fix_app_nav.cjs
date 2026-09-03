const fs = require('fs');
const file = 'src/App.tsx';
let data = fs.readFileSync(file, 'utf8');

if (!data.includes('import { NotificationsPage }')) {
  data = data.replace(
    "import { PatientDashboardPage } from './pages/PatientDashboardPage';",
    "import { PatientDashboardPage } from './pages/PatientDashboardPage';\nimport { NotificationsPage } from './pages/NotificationsPage';"
  );
}

if (!data.includes("case 'notifications':")) {
  data = data.replace(
    "case 'patient-dashboard':",
    "case 'notifications':\n            return <NotificationsPage />;\n          case 'patient-dashboard':"
  );
}

fs.writeFileSync(file, data);
