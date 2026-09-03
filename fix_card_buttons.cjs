const fs = require('fs');
const file = 'src/pages/FacilitiesPage.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  /onClick=\{\(\) => handleFacilitySelectFromList\(facility\)\}[\s\S]*?<Navigation className="w-3\.5 h-3\.5" \/>[\s\S]*?<span>\{language === 'mr' \? 'नकाशावर पहा' : language === 'hi' \? 'मानचित्र पर देखें' : 'View on Map'\}<\/span>/g,
  `onClick={() => setSelectedFacilityId(facility.id)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{language === 'mr' ? 'तपशील पहा' : language === 'hi' ? 'विवरण देखें' : 'View Details'}</span>`
);

fs.writeFileSync(file, data);
