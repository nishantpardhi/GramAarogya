const fs = require('fs');
const file = 'src/components/HealthcareMap.tsx';
let data = fs.readFileSync(file, 'utf8');

const targetStr = "${f.is24x7Emergency ? `<div style=\"font-size: 10px; font-weight: bold; color: #e11d48; margin-bottom: 6px;\">⚡ ${language === 'mr' ? '२४x७ आपत्कालीन व १०८ रुग्णवाहिका' : language === 'hi' ? '24x7 आपातकालीन व 108 एम्बुलेंस' : '24x7 Emergency & 108 Ambulance'}</div>` : ''}\n        </div>`;";

const replacementStr = "${f.is24x7Emergency ? `<div style=\"font-size: 10px; font-weight: bold; color: #e11d48; margin-bottom: 6px;\">⚡ ${language === 'mr' ? '२४x७ आपत्कालीन व १०८ रुग्णवाहिका' : language === 'hi' ? '24x7 आपातकालीन व 108 एम्बुलेंस' : '24x7 Emergency & 108 Ambulance'}</div>` : ''}\n          <div style=\"display: flex; gap: 8px; margin-top: 8px;\">\n            <button onclick=\"document.dispatchEvent(new CustomEvent('openFacilityDetails', {detail: '${f.id}'}))\" style=\"flex: 1; padding: 6px; background: #059669; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;\">${language === 'mr' ? 'तपशील पहा' : language === 'hi' ? 'विवरण देखें' : 'View Details'}</button>\n            <a href=\"https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"flex: 1; text-align: center; padding: 6px; background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 11px; font-weight: bold; text-decoration: none; cursor: pointer;\">${language === 'mr' ? 'दिशा' : language === 'hi' ? 'दिशा' : 'Directions'}</a>\n          </div>\n        </div>`;";

data = data.replace(targetStr, replacementStr);
fs.writeFileSync(file, data);
