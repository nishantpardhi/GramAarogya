const fs = require('fs');
const file = 'src/context/AppContext.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  'const loginAsDemoPatient = () => {',
  `const DEMO_PATIENT: any = { id: 'patient', role: 'patient', name: 'Patient' };
  const DEMO_DOCTOR: any = { id: 'doctor', role: 'doctor', name: 'Doctor' };
  const DEMO_ADMIN: any = { id: 'admin', role: 'admin', name: 'Admin' };
  const loginAsDemoPatient = () => {`
);

fs.writeFileSync(file, data);
console.log('Fixed AppContext demo vars');
