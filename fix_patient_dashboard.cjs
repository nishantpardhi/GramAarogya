const fs = require('fs');
const file = 'src/pages/PatientDashboardPage.tsx';

const content = `import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  PhoneCall,
  Sparkles,
  Building2,
  MapPin,
  ChevronRight,
  Bell,
  Stethoscope,
  Info
} from 'lucide-react';
import { LocationModal } from '../components/LocationModal';

export const PatientDashboardPage: React.FC = () => {
  const { currentUser, language, setCurrentPage, notifications, apiClient } = useApp();
  
  const [locationName, setLocationName] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(true);

  useEffect(() => {
    // Attempt to get Geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            const res = await fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${lat}&lon=\${lon}&zoom=10\`);
            const data = await res.json();
            const locName = data.address?.village || data.address?.town || data.address?.city || data.address?.county || currentUser?.village || 'Unknown Location';
            setLocationName(locName);
          } catch (e) {
            setLocationName(currentUser?.village || 'Unknown Location');
          }
          setIsLocating(false);
        },
        (error) => {
          console.warn('Geolocation denied or failed', error);
          setLocationName(currentUser?.village || 'Unknown Location');
          setIsLocating(false);
        },
        { timeout: 10000 }
      );
    } else {
      setLocationName(currentUser?.village || 'Unknown Location');
      setIsLocating(false);
    }
  }, [currentUser]);

  const patientDisplayName = currentUser?.name || (language === 'mr' ? 'रुग्ण' : language === 'hi' ? 'रोगी' : 'Patient');

  // Filter important updates (unread or specific types)
  const importantUpdates = notifications.filter(n => !n.isRead).slice(0, 3);

  return (
    <div className="min-h-[85vh] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pb-20 transition-colors">
      
      {/* 1. USER LOCATION & 2. GREETING */}
      <div className="bg-[#0F6B4F] text-white shadow-md rounded-b-3xl">
        <div className="max-w-md mx-auto px-5 pt-8 pb-10">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center space-x-1.5 bg-emerald-900/40 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-100 border border-emerald-700/50 self-start">
              <MapPin className="w-3.5 h-3.5" />
              <span>{isLocating ? 'Locating...' : \`\${locationName} (\${currentUser?.district || 'District'})\`}</span>
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight mt-2">
              Hello, {patientDisplayName} 👋
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 space-y-6">
        {/* 3. MAIN QUESTION */}
        <div className="text-center bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">
            {language === 'mr' ? 'आम्ही आज तुमची कशी मदत करू शकतो?' : language === 'hi' ? 'आज हम आपकी कैसे मदद कर सकते हैं?' : 'How can we help you today?'}
          </h2>
        </div>

        {/* 4. PRIMARY ACTION: TELL US YOUR HEALTH PROBLEM */}
        <button
          onClick={() => setCurrentPage('ai-assistant')}
          className="w-full text-left p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 border border-emerald-400 shadow-md hover:shadow-lg transition-all active:scale-[0.98] group flex flex-col justify-between space-y-3 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <ChevronRight className="w-6 h-6 text-emerald-100 group-hover:text-white group-hover:translate-x-1 transition-transform" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              🤒 {language === 'mr' ? 'तुमची आरोग्य समस्या सांगा' : language === 'hi' ? 'अपनी स्वास्थ्य समस्या बताएं' : 'Tell us your health problem'}
            </h3>
            <p className="text-emerald-50 text-sm font-medium mt-1.5 opacity-90">
              {language === 'mr' ? 'लक्षणे सांगून योग्य मार्गदर्शन मिळवा' : language === 'hi' ? 'लक्षण बताकर सही मार्गदर्शन प्राप्त करें' : 'Describe your symptoms for navigation guidance'}
            </p>
          </div>
        </button>

        {/* 5. PRIMARY ACTION: FIND HEALTHCARE NEAR ME */}
        <button
          onClick={() => setCurrentPage('facilities')}
          className="w-full text-left p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-blue-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all active:scale-[0.98] group flex flex-col justify-between space-y-3 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Building2 className="w-6 h-6" />
            </div>
            <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              🏥 {language === 'mr' ? 'माझ्या जवळील आरोग्य सेवा शोधा' : language === 'hi' ? 'मेरे पास स्वास्थ्य सेवा खोजें' : 'Find Healthcare Near Me'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1.5">
              {language === 'mr' ? 'जवळील दवाखाने आणि डॉक्टरांची माहिती' : language === 'hi' ? 'निकटतम अस्पताल और डॉक्टरों की जानकारी' : 'Locate nearby PHCs, hospitals & available doctors'}
            </p>
          </div>
        </button>

        {/* 6. EMERGENCY */}
        <div className="bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-100 dark:border-rose-900/50 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-rose-200 dark:bg-rose-900/50 flex items-center justify-center text-rose-700 dark:text-rose-400">
              <PhoneCall className="w-4 h-4 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400">
              🚨 {language === 'mr' ? 'आपत्कालीन' : language === 'hi' ? 'आपातकालीन' : 'Emergency'}
            </h3>
          </div>
          
          <div className="space-y-3">
            <a href="tel:108" className="flex items-center justify-center w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-colors">
              📞 {language === 'mr' ? '१०८ ला कॉल करा' : language === 'hi' ? '१०८ पर कॉल करें' : 'Call 108'}
            </a>
            
            <button 
              onClick={() => setCurrentPage('emergency')}
              className="flex items-center justify-center w-full bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold py-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
            >
              🏥 {language === 'mr' ? 'जवळचे आपत्कालीन केंद्र शोधा' : language === 'hi' ? 'निकटतम आपातकालीन केंद्र खोजें' : 'Find Nearest Emergency Healthcare'}
            </button>
          </div>
        </div>

        {/* 7. IMPORTANT UPDATES */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {language === 'mr' ? 'महत्वाचे अपडेट्स' : language === 'hi' ? 'महत्वपूर्ण अपडेट्स' : 'Important Updates'}
            </h3>
          </div>

          {importantUpdates.length > 0 ? (
            <div className="space-y-3">
              {importantUpdates.map(update => (
                <div key={update.id} className="p-3 bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700 rounded-xl flex items-start space-x-3">
                  <div className="mt-0.5 text-blue-500">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{update.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{update.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {language === 'mr' ? 'सध्या कोणतेही नवीन अपडेट्स नाहीत.' : language === 'hi' ? 'वर्तमान में कोई नया अपडेट नहीं है।' : 'No new updates right now.'}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
`;

fs.writeFileSync(file, content);
