const fs = require('fs');
const file = 'src/pages/LoginPage.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  /<button[\s\S]*?id="btn-demo-doctor-fill"[\s\S]*?<\/button>/,
  ''
);

fs.writeFileSync(file, data);
console.log('Wiped demo button from login');
