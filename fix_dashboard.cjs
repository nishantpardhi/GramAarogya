const fs = require('fs');
const file = 'src/pages/PatientDashboardPage.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/\{\s*id: 'appointments',[\s\S]*?desc: language === 'mr' \? 'डॉक्टरांना भेटा' : 'Book a clinic appointment',\s*\},/g, '');
data = data.replace(/\{\s*id: 'telemedicine',[\s\S]*?desc: language === 'mr' \? 'व्हिडिओ कॉल द्वारे सल्ला' : 'Consult doctor via video',\s*\},/g, '');
data = data.replace(/\{\s*id: 'my-appointments',[\s\S]*?desc: language === 'mr' \? 'अपॉइंटमेंट स्थिती पहा' : 'View appointment status',\s*\},/g, '');

fs.writeFileSync(file, data);
