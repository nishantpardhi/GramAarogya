import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Type, Eye, Volume2, WifiOff, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { accessibility, updateAccessibility, lowDataMode, setLowDataMode, language } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <h3 className="font-bold text-lg">
              {language === 'mr' ? 'सुलभता आणि दृश्य पर्याय (Accessibility)' : language === 'hi' ? 'अभिगम्यता और दृश्य विकल्प' : 'Accessibility & Visual Settings'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-emerald-800 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-slate-800 dark:text-slate-200">
          {/* Font Size */}
          <div>
            <label className="flex items-center space-x-2 font-medium mb-3 text-sm text-slate-700 dark:text-slate-300">
              <Type className="w-4 h-4 text-emerald-600" />
              <span>{language === 'mr' ? 'अक्षरांचा आकार (Text Size)' : language === 'hi' ? 'अक्षर का आकार' : 'Font Size Scaling'}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateAccessibility({ fontSize: 'normal' })}
                className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                  accessibility.fontSize === 'normal'
                    ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300'
                    : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                A {language === 'mr' ? 'सामान्य' : 'Regular'}
              </button>
              <button
                type="button"
                onClick={() => updateAccessibility({ fontSize: 'large' })}
                className={`py-2 px-3 rounded-lg border text-base font-semibold transition-all ${
                  accessibility.fontSize === 'large'
                    ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300'
                    : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                A+ {language === 'mr' ? 'मोठा' : 'Large'}
              </button>
              <button
                type="button"
                onClick={() => updateAccessibility({ fontSize: 'xlarge' })}
                className={`py-2 px-3 rounded-lg border text-lg font-bold transition-all ${
                  accessibility.fontSize === 'xlarge'
                    ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300'
                    : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                A++ {language === 'mr' ? 'अति मोठा' : 'Extra Large'}
              </button>
            </div>
          </div>

          {/* High Contrast Mode */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center space-x-3">
              <Eye className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="font-semibold text-sm">
                  {language === 'mr' ? 'उच्च कॉन्ट्रास्ट मोड (High Contrast)' : language === 'hi' ? 'उच्च कंट्रास्ट मोड' : 'High Contrast Mode'}
                </div>
                <div className="text-xs text-slate-500">
                  {language === 'mr' ? 'वाचायला अधिक सोपे काळे व पिवळे रंग' : 'Optimized for high readability'}
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={accessibility.highContrast}
              onChange={(e) => updateAccessibility({ highContrast: e.target.checked })}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          {/* Low Data Mode Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center space-x-3">
              <WifiOff className="w-5 h-5 text-amber-600" />
              <div>
                <div className="font-semibold text-sm">
                  {language === 'mr' ? 'कमी डेटा मोड (Low Data Mode)' : language === 'hi' ? 'कम डेटा मोड' : 'Low-Bandwidth Mode'}
                </div>
                <div className="text-xs text-slate-500">
                  {language === 'mr' ? '२G/३G नेटवर्कवर जलद लोड होण्यासाठी' : 'Optimized for 2G/3G rural networks'}
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={lowDataMode}
              onChange={(e) => setLowDataMode(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          {/* Voice Screen Reader Simulator */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center space-x-3">
              <Volume2 className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-semibold text-sm">
                  {language === 'mr' ? 'ध्वनी सहाय्यक (Voice Assistance)' : language === 'hi' ? 'ध्वनि सहायक' : 'Voice Assistance'}
                </div>
                <div className="text-xs text-slate-500">
                  {language === 'mr' ? 'मजकूर ऑडिओद्वारे ऐकण्यासाठी' : 'Audio guidance for low literacy'}
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={accessibility.screenReaderVoice}
              onChange={(e) => updateAccessibility({ screenReaderVoice: e.target.checked })}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 dark:bg-slate-800/80 px-6 py-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-5 py-2 rounded-lg transition-colors text-sm shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>{language === 'mr' ? 'पूर्ण झाले (Done)' : 'Apply Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
