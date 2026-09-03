const fs = require('fs');
const file = 'src/services/secureAuthHelper.ts';
let data = fs.readFileSync(file, 'utf8');

// Remove doc-demo
data = data.replace(/\{\s*doctorId: 'doc-demo',[\s\S]*?avatarUrl: '.*?',\s*\},\s*/g, '');

// Empty the DEFAULT_PATIENT_ACCOUNT? The user wants no fake profiles. 
// "Remove completely: Any demo badges, Any sample-data warnings, etc." 
// "Do not simply remove the [DEMO] text while keeping the same hardcoded doctors. Replace the current hardcoded doctor list with a proper backend-driven healthcare data system."
fs.writeFileSync(file, data);
