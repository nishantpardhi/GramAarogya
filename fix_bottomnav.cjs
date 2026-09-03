const fs = require('fs');
const file = 'src/components/BottomNavBar.tsx';
let data = fs.readFileSync(file, 'utf8');

const replacement = `
    const patientItems = [
      {
        id: 'patient-dashboard',
        label: language === 'mr' ? 'होम' : language === 'hi' ? 'होम' : 'Home',
        icon: LayoutDashboard,
        page: 'patient-dashboard',
        active: currentPage === 'patient-dashboard',
      },
      {
        id: 'facilities',
        label: language === 'mr' ? 'आरोग्य सेवा' : language === 'hi' ? 'स्वास्थ्य सेवा' : 'Healthcare',
        icon: Building2,
        page: 'facilities',
        active: currentPage === 'facilities',
      },
      {
        id: 'notifications',
        label: language === 'mr' ? 'अपडेट्स' : language === 'hi' ? 'अपडेट्स' : 'Updates',
        icon: Activity,
        page: 'notifications', // Assuming there's a notifications page or we'll route to it
        active: currentPage === 'notifications',
      },
      {
        id: 'patient-profile',
        label: language === 'mr' ? 'प्रोफाईल' : language === 'hi' ? 'प्रोफ़ाइल' : 'Profile',
        icon: User,
        page: 'patient-profile',
        active: currentPage === 'patient-profile',
      },
    ];
`;

data = data.replace(/const patientItems = \[[\s\S]*?\];/m, replacement.trim());

fs.writeFileSync(file, data);
