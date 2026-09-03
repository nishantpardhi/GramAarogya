const fs = require('fs');
const file = 'src/components/FacilityDetailsModal.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  /\{language === 'mr' \? 'प्रत्यक्ष भेट द्या \(दिशा\)' : 'Visit Offline \(Directions\)'\}/g,
  "{language === 'mr' ? 'दिशा मिळवा' : language === 'hi' ? 'दिशा प्राप्त करें' : 'Get Directions'}"
);

fs.writeFileSync(file, data);
