const fs = require('fs');
const file = 'src/pages/AppointmentsPage.tsx';
let data = fs.readFileSync(file, 'utf8');

// Replace Token references
data = data.replace(/Token Number/gi, 'Request ID');
data = data.replace(/टोकन क्रमांक/gi, 'विनंती क्रमांक');
data = data.replace(/टोकन संख्या/gi, 'अनुरोध आईडी');

data = data.replace(/tokenNumber/g, 'requestId');
data = data.replace(/setBookedToken/g, 'setBookedRequest');
data = data.replace(/bookedToken/g, 'bookedRequest');

data = data.replace(/Digital OPD Token/gi, 'Telemedicine Consultation');
data = data.replace(/OPD Token/gi, 'Telemedicine Consultation');

data = data.replace(/मोबाईल नंबर \(SMS टोकनसाठी\)/g, 'मोबाईल नंबर (अपडेट्ससाठी)');
data = data.replace(/मोबाइल नंबर \(SMS टोकन हेतु\)/g, 'मोबाइल नंबर (अपडेट्स के लिए)');
data = data.replace(/Mobile Number \(for Token SMS\)/g, 'Mobile Number (for Updates)');

data = data.replace(/Registering Token\.\.\./g, 'Submitting Request...');
data = data.replace(/नोंदणी होत आहे\.\.\./g, 'सबमिट करत आहे...');
data = data.replace(/पंजीकरण हो रहा है\.\.\./g, 'सबमिट हो रहा है...');

fs.writeFileSync(file, data);
