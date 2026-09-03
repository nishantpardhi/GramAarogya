const fs = require('fs');
const file = 'src/components/HealthcareMap.tsx';
let data = fs.readFileSync(file, 'utf8');

const syncEffect = `
  useEffect(() => {
    if (userCoords && (userCoords.lat !== activeCoords.lat || userCoords.lng !== activeCoords.lng)) {
      setActiveCoords(userCoords);
      setActiveLocationName(language === 'mr' ? 'आपले स्थान' : language === 'hi' ? 'आपका स्थान' : 'Your Location');
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([userCoords.lat, userCoords.lng], 11, { duration: 0.8 });
      }
    }
  }, [userCoords, language]);

  // Sync activeCoords upwards if they change
  useEffect(() => {
    if (onUserCoordsChange) {
      onUserCoordsChange({ lat: activeCoords.lat, lng: activeCoords.lng, locationName: activeLocationName });
    }
  }, [activeCoords, activeLocationName]);
`;

data = data.replace(/\/\/ Handle Initialize & Config/, '// Handle Initialize & Config\n' + syncEffect);

fs.writeFileSync(file, data);
