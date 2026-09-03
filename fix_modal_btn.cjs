const fs = require('fs');
const file = 'src/components/FacilityDetailsModal.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/{language === 'mr' \? 'टेलिमेडिसिन' : 'Telemedicine'}/g, "{language === 'mr' ? 'टेलिमेडिसिन विनंती' : language === 'hi' ? 'टेलीमेडिसिन अनुरोध' : 'Request Telemedicine'}");

fs.writeFileSync(file, data);
