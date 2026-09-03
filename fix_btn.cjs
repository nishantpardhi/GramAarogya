const fs = require('fs');
const file = 'src/pages/AppointmentsPage.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace("'Confirm Digital OPD Token Registration'", "'Confirm Telemedicine Request'");
data = data.replace("'डिजिटल ओपीडी टोकन पुष्ट करें'", "'वीडियो परामर्श बुक करें'");
data = data.replace("'डिजिटल ओपीडी टोकन निश्चित करा'", "'टेलिमेडिसिन व्हिडिओ भेट निश्चित करा'");

fs.writeFileSync(file, data);
