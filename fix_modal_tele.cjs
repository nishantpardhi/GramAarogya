const fs = require('fs');
const file = 'src/components/FacilityDetailsModal.tsx';
let data = fs.readFileSync(file, 'utf8');

const targetStr = `<button
                        onClick={() => handleRequestTelemedicine(doc.id)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Video className="w-3.5 h-3.5" />
                        {language === 'mr' ? 'टेलिमेडिसिन विनंती' : language === 'hi' ? 'टेलीमेडिसिन अनुरोध' : 'Request Telemedicine'}
                      </button>`;

const replacementStr = `{doc.consultationType && doc.consultationType.includes('Telemedicine') && (
                        <button
                          onClick={() => handleRequestTelemedicine(doc.id)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Video className="w-3.5 h-3.5" />
                          {language === 'mr' ? 'टेलिमेडिसिन विनंती' : language === 'hi' ? 'टेलीमेडिसिन अनुरोध' : 'Request Telemedicine'}
                        </button>
                      )}`;

data = data.replace(targetStr, replacementStr);
fs.writeFileSync(file, data);
