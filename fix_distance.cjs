const fs = require('fs');
const file = 'src/pages/FacilitiesPage.tsx';
let data = fs.readFileSync(file, 'utf8');

// The calculateHaversineDistance is likely in '../utils/helpers' or we can just inject it.
const calcLogic = `
  const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const currentLat = userCoords ? userCoords.lat : 21.3966;
  const currentLng = userCoords ? userCoords.lng : 79.3274;

  const processedFacilities = (facilities || []).map(f => ({
    ...f,
    distanceKm: calculateHaversineDistance(currentLat, currentLng, f.lat, f.lng)
  }));

  const filteredFacilities = processedFacilities.filter((f) => {
`;

data = data.replace(/const filteredFacilities = \(facilities \|\| \[\]\)\.filter\(\(f\) => \{/, calcLogic);

fs.writeFileSync(file, data);
