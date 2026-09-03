import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, KeyRound, Cpu, Server, CheckCircle2 } from 'lucide-react';

interface DataUnavailableCardProps {
  title?: string;
  sourceName: string;
  requiredEndpoint: string;
  message?: string;
  suggestedActionText?: string;
}

export const DataUnavailableCard: React.FC<DataUnavailableCardProps> = ({
  title,
  sourceName,
  requiredEndpoint,
  message,
}) => {
  const { t, language, setCurrentPage } = useApp();

  const defaultTitle =
    t('auto.text_1040');

  const defaultDesc =
    language === 'mr'
      ? `थेट उत्पादन प्रणालीमध्ये बनावट माहिती दाखवली जात नाही. ही माहिती मिळवण्यासाठी महाराष्ट्र शासन / ABDM (${sourceName}) अधिकृत API जोडणी आवश्यक आहे.`
      : language === 'hi'
      ? `उत्पादन प्रणाली में कोई नकली डेटा नहीं दिखाया जाता है। लाइव रिकॉर्ड के लिए महाराष्ट्र सरकार / ABDM (${sourceName}) का अधिकृत API कनेक्शन आवश्यक है।`
      : `Production mode enforces zero fabricated healthcare data. To stream live verified records, an active credentialed link to the government gateway (${sourceName}) is required.`;

  return (
    <div className="rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-6 sm:p-8 text-center max-w-2xl mx-auto my-8 shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800">
        <ShieldAlert className="w-7 h-7" />
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
        {title || message || defaultTitle}
      </h3>

      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 max-w-lg mx-auto leading-relaxed">
        {defaultDesc}
      </p>

      {/* Target Source Box */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 text-left text-xs font-mono text-slate-700 dark:text-slate-300 mb-6 flex items-start gap-2 max-w-lg mx-auto overflow-x-auto">
        <Server className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-slate-900 dark:text-white font-sans text-xs">
            {t('auto.text_1041')}
          </div>
          <div className="text-slate-500 break-all">{requiredEndpoint}</div>
        </div>
      </div>

      {/* Actions: Connect Gateway or Switch to SIH Demo Mode */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        

        <button
          onClick={() => setCurrentPage('api-diagnostics')}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <KeyRound className="w-4 h-4 text-emerald-600" />
          <span>
            {t('auto.text_1042')}
          </span>
        </button>
      </div>

      <div className="mt-4 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>
          {t('auto.text_1043')}
        </span>
      </div>
    </div>
  );
};
