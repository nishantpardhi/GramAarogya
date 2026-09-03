import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Info, ArrowLeft } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, language, setCurrentPage } = useApp();

  return (
    <div className="min-h-[85vh] bg-slate-50 dark:bg-slate-900 pb-20">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => setCurrentPage('patient-dashboard')}
          className="p-2 mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
          <Bell className="w-5 h-5 mr-2 text-amber-500" />
          {language === 'mr' ? 'अपडेट्स' : language === 'hi' ? 'अपडेट्स' : 'Updates'}
        </h1>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-3 mt-2">
        {notifications.length > 0 ? (
          notifications.map(update => (
            <div key={update.id} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-start space-x-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="mt-1 flex-shrink-0 text-blue-500 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-full">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{update.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{update.message}</p>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                  {new Date(update.timestamp).toLocaleString(language === 'mr' ? 'mr-IN' : 'en-IN', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
              {language === 'mr' ? 'कोणतेही अपडेट्स नाहीत' : language === 'hi' ? 'कोई अपडेट नहीं' : 'No Updates'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {language === 'mr' ? 'सध्या कोणतेही नवीन अपडेट्स किंवा सूचना नाहीत.' : language === 'hi' ? 'वर्तमान में कोई नया अपडेट या सूचना नहीं है।' : 'You have no new updates or notifications right now.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
