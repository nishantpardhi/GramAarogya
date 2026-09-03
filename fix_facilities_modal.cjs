const fs = require('fs');
const file = 'src/pages/FacilitiesPage.tsx';
let data = fs.readFileSync(file, 'utf8');

// Remove all occurrences
data = data.replace(/<FacilityDetailsModal facility=\{selectedFacility\} onClose=\{\(\) => setSelectedFacilityId\(null\)\} \/>/g, '');
data = data.replace(/import \{ FacilityDetailsModal \} from '\.\.\/components\/FacilityDetailsModal';/g, "import { FacilityDetailsModal } from '../components/FacilityDetailsModal';");

// Insert just one at the end before closing div
data = data.replace(/    <\/div>\n  \);\n};\n$/m, `      <FacilityDetailsModal facility={selectedFacility} onClose={() => setSelectedFacilityId(null)} />\n    </div>\n  );\n};\n`);

fs.writeFileSync(file, data);
