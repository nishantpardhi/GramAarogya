const fs = require('fs');
const file = 'src/components/BottomNavBar.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/z-40/g, 'z-50');

fs.writeFileSync(file, code);
