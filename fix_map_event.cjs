const fs = require('fs');
const file = 'src/components/HealthcareMap.tsx';
let data = fs.readFileSync(file, 'utf8');

const eventListenerHook = `
  useEffect(() => {
    const handleOpenDetails = (e: any) => {
      const facilityId = e.detail;
      const f = facilities.find(fac => fac.id === facilityId);
      if (f && onSelectFacility) {
        onSelectFacility(f);
      }
    };
    document.addEventListener('openFacilityDetails', handleOpenDetails);
    return () => document.removeEventListener('openFacilityDetails', handleOpenDetails);
  }, [facilities, onSelectFacility]);

  // Handle Initialize & Config
`;

data = data.replace(/\/\/ Handle Initialize & Config/, eventListenerHook);

fs.writeFileSync(file, data);
