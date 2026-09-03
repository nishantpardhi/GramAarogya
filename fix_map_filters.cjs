const fs = require('fs');
const file = 'src/pages/FacilitiesPage.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  /onUserCoordsChange=\{\(coords\) => setUserCoords\(coords\)\}/,
  'onUserCoordsChange={(coords) => setUserCoords(coords)}\n            showFilters={false}'
);

fs.writeFileSync(file, data);
