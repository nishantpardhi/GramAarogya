const fs = require('fs');
const file = 'src/pages/PatientDashboardPage.tsx';
let data = fs.readFileSync(file, 'utf8');

// Replace the MapPin span with a button
const locUi = `
            <button 
              onClick={() => {
                const manualLoc = prompt(language === 'mr' ? 'तुमचा पत्ता किंवा पिनकोड प्रविष्ट करा:' : language === 'hi' ? 'अपना स्थान या पिन कोड दर्ज करें:' : 'Enter your village, city or PIN code:');
                if (manualLoc) {
                  setLocationName(manualLoc);
                }
              }}
              className="inline-flex items-center space-x-1.5 bg-emerald-900/40 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-100 border border-emerald-700/50 self-start cursor-pointer hover:bg-emerald-900/60 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{isLocating ? 'Locating...' : \`\${locationName}\`}</span>
            </button>
`;

data = data.replace(/<div className="inline-flex items-center space-x-1\.5 bg-emerald-900\/40 px-3 py-1\.5 rounded-full text-xs font-medium text-emerald-100 border border-emerald-700\/50 self-start">[\s\S]*?<\/div>/m, locUi.trim());

fs.writeFileSync(file, data);
