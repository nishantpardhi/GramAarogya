const fs = require('fs');
const file = 'src/pages/FacilitiesPage.tsx';
let data = fs.readFileSync(file, 'utf8');

const oldEmptyState = `{filteredFacilities.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {language === 'mr' ? 'प्रमाणित माहिती सध्या उपलब्ध नाही.' : language === 'hi' ? 'सत्यापित जानकारी वर्तमान में अनुपलब्ध है।' : 'Verified information is currently unavailable.'}
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            {language === 'mr' ? 'तुमच्या जवळील प्रमाणित आरोग्य केंद्रांची माहिती लवकरच उपलब्ध होईल.' : language === 'hi' ? 'आपके निकट सत्यापित स्वास्थ्य केंद्रों की जानकारी शीघ्र ही उपलब्ध होगी।' : 'Verified healthcare facilities near you will be available soon.'}
          </p>
              </div>
      )}`;

const newEmptyState = `{filteredFacilities.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {language === 'mr' ? 'तुमच्या शोधानुसार कोणतीही आरोग्य केंद्रे आढळली नाहीत.' : language === 'hi' ? 'आपकी खोज के लिए कोई स्वास्थ्य केंद्र नहीं मिला।' : 'No healthcare facilities were found for your current search.'}
          </h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            {language === 'mr' ? 'कृपया फिल्टर काढा किंवा वेगळा विभाग निवडून पुन्हा प्रयत्न करा.' : language === 'hi' ? 'कृपया फ़िल्टर हटाएं या कोई अन्य स्थान चुनकर पुनः प्रयास करें।' : 'Please try adjusting your filters, searching for a different location, or clearing your search.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDistrict('ALL');
                setSelectedType('ALL');
                setOnlyEmergency(false);
                setOnlyFreeMeds(false);
              }}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer"
            >
              {language === 'mr' ? 'फिल्टर काढा' : language === 'hi' ? 'फ़िल्टर साफ़ करें' : 'Clear Filters'}
            </button>
            <button
              onClick={() => {
                const el = document.querySelector('input[type="text"]');
                if(el) (el as HTMLInputElement).focus();
              }}
              className="px-6 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              {language === 'mr' ? 'पुन्हा शोधा' : language === 'hi' ? 'पुनः खोजें' : 'Search Again'}
            </button>
          </div>
        </div>
      )}`;

if(data.includes("Verified information is currently unavailable.")) {
    data = data.replace(/\{filteredFacilities\.length === 0 && \([\s\S]*?\)\}/, newEmptyState);
    fs.writeFileSync(file, data);
    console.log("Replaced empty state");
} else {
    console.log("Could not find old empty state block");
}

