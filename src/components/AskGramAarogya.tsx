import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Mic,
  Send,
  Building2,
  Stethoscope,
  PhoneCall,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  LocateFixed,
} from 'lucide-react';

interface TriageResult {
  detectedLanguage: 'mr' | 'hi' | 'en';
  clinicalNeed: string;
  clinicalNeedMr: string;
  clinicalNeedHi?: string;
  urgency: 'Emergency' | 'High' | 'Moderate' | 'Routine';
  isEmergency: boolean;
  emergencyGuidance?: string;
  recommendedFacilityType: string;
  recommendedSpecialty: string;
  matchedFacilityId?: string;
  matchedFacilityName?: string;
  matchedDoctorId?: string;
  matchedDoctorName?: string;
  applicableScheme?: string;
  schemeBenefit?: string;
  suggestedMedicines?: string[];
  aiSummary: string;
  aiSummaryMr?: string;
  aiSummaryHi?: string;
}

export const AskGramAarogya: React.FC = () => {
  const { language, t, setCurrentPage, facilities, doctors } = useApp();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [locationDetecting, setLocationDetecting] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Quick suggestion chips based on active language
  const quickChips =
    language === 'mr'
      ? [
          { text: 'मला दोन दिवसांपासून ताप आहे. जवळ सरकारी डॉक्टर कुठे आहेत?' },
          { text: 'जवळचे प्राथमिक आरोग्य केंद्र (PHC) शोधा.' },
          { text: 'मला डॉक्टरांची ओपीडी अपॉइंटमेंट बुक करायची आहे.' },
          { text: 'महात्मा फुले जन आरोग्य योजना (MJPJAY) कशी मिळेल?' },
        ]
      : language === 'hi'
      ? [
          { text: 'मुझे दो दिन से बुखार है। नजदीकी सरकारी डॉक्टर कहाँ हैं?' },
          { text: 'निकटतम प्राथमिक स्वास्थ्य केंद्र (PHC) खोजें।' },
          { text: 'मुझे डॉक्टर अपॉइंटमेंट बुक करनी है।' },
          { text: 'आयुष्मान भारत और MJPJAY योजना का लाभ कैसे लें?' },
        ]
      : [
          { text: 'I have had fever for 2 days. Where is the nearest government doctor?' },
          { text: 'Find a nearby Primary Health Centre (PHC).' },
          { text: 'Book an OPD appointment and token.' },
          { text: 'Check eligibility for MJPJAY health scheme.' },
        ];

  // Setup Web Speech API for voice input
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = t('auto.text_1012');

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        handleAnalyze(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const handleVoiceToggle = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang =
            t('auto.text_1013');
          recognitionRef.current.start();
          setIsListening(true);
        } catch {
          setIsListening(false);
        }
      } else {
        const fallbackText =
          t('auto.text_1014');
        setQuery(fallbackText);
        handleAnalyze(fallbackText);
      }
    }
  };

  const handleLocateMe = () => {
    setLocationDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationDetecting(false);
          const locText =
            language === 'mr'
              ? `रामटेक / मनसर (अक्षांश: ${pos.coords.latitude.toFixed(2)})`
              : language === 'hi'
              ? `रामटेक / मनसर (अक्षांश: ${pos.coords.latitude.toFixed(2)})`
              : `Ramtek / Mansar (Lat: ${pos.coords.latitude.toFixed(2)})`;
          setUserLocation(locText);
        },
        () => {
          setLocationDetecting(false);
          setUserLocation(t('auto.text_1015'));
        },
        { timeout: 4000 }
      );
    } else {
      setLocationDetecting(false);
      setUserLocation(t('auto.text_1016'));
    }
  };

  const handleAnalyze = async (inputQuery?: string) => {
    const text = (inputQuery || query).trim();
    if (!text) return;

    setIsLoading(true);
    setResult(null);

    try {
      // Call backend API with selected language and token
      const token = localStorage.getItem('gramarogya_jwt_auth_token');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: text,
          query: text,
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult({
          detectedLanguage: language,
          clinicalNeed: data.clinicalNeed || text,
          clinicalNeedMr: data.clinicalNeedMr || text,
          clinicalNeedHi: data.clinicalNeedHi || data.clinicalNeed || text,
          urgency: data.urgency || (data.isEmergency ? 'Emergency' : 'Moderate'),
          isEmergency: Boolean(data.isEmergency),
          emergencyGuidance: data.emergencyGuidance,
          recommendedFacilityType: data.recommendedFacilityType || 'Primary Health Centre (PHC)',
          recommendedSpecialty: data.recommendedSpecialty || 'General Medicine',
          matchedFacilityId: data.matchedFacilityId || facilities[0]?.id,
          matchedFacilityName: language === 'mr' ? data.matchedFacilityNameMr || facilities[0]?.nameMr : data.matchedFacilityName || facilities[0]?.name,
          matchedDoctorId: data.matchedDoctorId || doctors[0]?.id,
          matchedDoctorName: language === 'mr' ? doctors[0]?.nameMr : doctors[0]?.name,
          applicableScheme: data.applicableScheme || 'Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)',
          schemeBenefit: data.schemeBenefit || (t('auto.text_1017')),
          aiSummary: data.aiSummary || text,
          aiSummaryMr: data.aiSummaryMr || data.aiSummary,
          aiSummaryHi: data.aiSummaryHi || data.aiSummary,
        });
        setIsLoading(false);
        return;
      }
    } catch {
      // Fall through to local fallback
    }

    // Local smart fallback
    const lower = text.toLowerCase();
    if (
      lower.includes('सर्पदंश') ||
      lower.includes('साप') ||
      lower.includes('snake') ||
      lower.includes('सांप') ||
      lower.includes('छातीत कळ') ||
      lower.includes('chest pain') ||
      lower.includes('हार्ट')
    ) {
      const phc = facilities.find((f) => f.is24x7Emergency) || facilities[0];
      setResult({
        detectedLanguage: language,
        clinicalNeed: 'Acute Emergency Care / Anti-Snake Venom (ASV)',
        clinicalNeedMr: 'तातडीची आपत्कालीन वैद्यकीय मदत / सर्पदंश विरोधी लस (ASV)',
        clinicalNeedHi: 'आपातकालीन चिकित्सा सहायता / एंटी-स्नेक वेनम (ASV)',
        urgency: 'Emergency',
        isEmergency: true,
        emergencyGuidance:
          t('auto.text_1018'),
        recommendedFacilityType: 'PHC / 24x7 Trauma Center',
        recommendedSpecialty: 'Emergency Medicine Officer',
        matchedFacilityId: phc.id,
        matchedFacilityName: language === 'mr' ? phc.nameMr : phc.name,
        matchedDoctorId: 'doc-1',
        matchedDoctorName: t('auto.text_1030'),
        applicableScheme: 'Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)',
        schemeBenefit: t('auto.text_1019'),
        aiSummary:
          'Critical emergency identified. Recommending immediate transit to nearest verified government facility with 24x7 emergency and ASV stock.',
        aiSummaryMr:
          'तातडीची आपत्कालीन गरज ओळखली गेली आहे. मोफत १०८ रुग्णवाहिका व जवळच्या शासकीय केंद्रात तात्काळ जाण्याचा सल्ला दिला जात आहे.',
        aiSummaryHi:
          'आपातकालीन स्थिति पहचानी गई है। तुरंत 108 एम्बुलेंस बुलाएं या नजदीकी सरकारी प्राथमिक स्वास्थ्य केंद्र पहुंचें।',
      });
    } else {
      const matchedFac = facilities[0];
      const matchedDoc = doctors[0];
      setResult({
        detectedLanguage: language,
        clinicalNeed: 'General OPD Consultation & Health Navigation',
        clinicalNeedMr: 'जनरल ओपीडी तपासणी व आरोग्य मार्गदर्शन',
        clinicalNeedHi: 'सामान्य ओपीडी परामर्श व स्वास्थ्य मार्गदर्शन',
        urgency: 'Moderate',
        isEmergency: false,
        recommendedFacilityType: 'Primary Health Centre (PHC)',
        recommendedSpecialty: 'General Medicine (एमबीबीएस वैद्यकीय अधिकारी)',
        matchedFacilityId: matchedFac?.id,
        matchedFacilityName: language === 'mr' ? matchedFac?.nameMr : matchedFac?.name,
        matchedDoctorId: matchedDoc?.id,
        matchedDoctorName: language === 'mr' ? matchedDoc?.nameMr : matchedDoc?.name,
        applicableScheme: 'Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)',
        schemeBenefit: t('auto.text_1020'),
        aiSummary:
          'Recommending OPD token with Dr. Rameshwar Deshmukh at PHC Ramtek (3.4 km). Free consultation and medicines available.',
        aiSummaryMr:
          'प्राथमिक आरोग्य केंद्र रामटेक (३.४ किमी) येथे डॉ. रामेश्वर देशमुख यांच्याकडे मोफत ओपीडी तपासणी व औषधे उपलब्ध आहेत.',
        aiSummaryHi:
          'प्राथमिक स्वास्थ्य केंद्र रामटेक (3.4 किमी) में डॉ. रामेश्वर देशमुख के पास मुफ्त ओपीडी परामर्श और दवाएं उपलब्ध हैं।',
      });
    }

    setIsLoading(false);
  };

  return (
    <div id="ask-gramaarogya-section" className="space-y-6">
      {/* Hero Content Box */}
      <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 dark:bg-emerald-950/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        {/* Hero Headings */}
        <div className="max-w-3xl space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              {t('auto.text_1021')}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {t('hero.title')}{' '}
            <span className="text-[#0F6B4F] dark:text-emerald-400">
              {t('auto.text_1022')}
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Interactive "Ask GramAarogya" Input Card */}
        <div className="bg-slate-50 dark:bg-slate-800/90 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="gramaarogya-search-input"
              className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('hero.askHealthcare')}</span>
            </label>

            {/* Location indicator button */}
            <button
              id="assistant-location-button"
              onClick={handleLocateMe}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-emerald-500 transition-colors cursor-pointer"
            >
              <LocateFixed className={`w-3.5 h-3.5 ${locationDetecting ? 'animate-spin text-emerald-600' : 'text-emerald-600'}`} />
              <span className="truncate max-w-[130px] sm:max-w-[200px]">
                {userLocation || (t('auto.text_1023'))}
              </span>
            </button>
          </div>

          {/* Primary Input with Voice & Submit Button */}
          <div className="relative flex items-center">
            <input
              id="gramaarogya-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder={t('hero.searchPlaceholder')}
              className="w-full pl-4 pr-32 sm:pr-48 py-3.5 sm:py-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-inner"
            />

            {/* Input Action Controls */}
            <div className="absolute right-2 flex items-center gap-1.5">
              {/* Mic Voice Button */}
              <button
                id="assistant-voice-input-button"
                onClick={handleVoiceToggle}
                className={`p-2.5 rounded-lg transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title={isListening ? 'Listening...' : t('auto.text_1024')}
                aria-label="Voice Input"
              >
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Submit Ask GramAarogya Button */}
              <button
                id="assistant-submit-button"
                onClick={() => handleAnalyze()}
                disabled={isLoading || !query.trim()}
                className="px-3.5 sm:px-5 py-2.5 rounded-lg bg-[#0F6B4F] hover:bg-[#0c5740] disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{t('hero.askButton')}</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Chips */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {t('auto.text_1025')}
            </div>
            <div className="flex flex-wrap gap-2">
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(chip.text);
                    handleAnalyze(chip.text);
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors text-left cursor-pointer shadow-2xs font-medium"
                >
                  {chip.text}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic AI Triage & Recommendation Result */}
        {result && (
          <div
            id="assistant-triage-results"
            className="mt-6 rounded-2xl p-5 sm:p-6 border transition-all animate-in fade-in zoom-in-95 duration-150 text-left space-y-5 bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
          >
            {/* Urgency & Clinical Need Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-200/80 dark:border-emerald-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      result.isEmergency
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-emerald-700 text-white'
                    }`}
                  >
                    {result.urgency}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {t('auto.text_1026')}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {language === 'mr' ? result.clinicalNeedMr : language === 'hi' ? result.clinicalNeedHi || result.clinicalNeed : result.clinicalNeed}
                </h4>
              </div>

              {result.isEmergency && (
                <button
                  onClick={() => setCurrentPage('emergency')}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer animate-bounce"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{t('buttons.call108')}</span>
                </button>
              )}
            </div>

            {/* Emergency Alert Guidance if critical */}
            {result.emergencyGuidance && (
              <div className="p-3.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs font-semibold leading-relaxed flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <span>{result.emergencyGuidance}</span>
              </div>
            )}

            {/* Summary Text */}
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {language === 'mr' ? result.aiSummaryMr || result.aiSummary : language === 'hi' ? result.aiSummaryHi || result.aiSummary : result.aiSummary}
            </p>

            {/* Grid of Matched Facility, Doctor, and Scheme */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Matched Facility */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                  <Building2 className="w-4 h-4" />
                  <span>{t('auto.text_1027')}</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {result.matchedFacilityName || (t('auto.text_1031'))}
                </div>
                <div className="text-[11px] text-slate-500">{result.recommendedFacilityType}</div>
                <button
                  onClick={() => setCurrentPage('facilities')}
                  className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold text-[11px] pt-1 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{t('buttons.getDirections')}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Matched Doctor */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-bold">
                  <Stethoscope className="w-4 h-4" />
                  <span>{t('auto.text_1028')}</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {result.matchedDoctorName || (t('auto.text_1032'))}
                </div>
                <div className="text-[11px] text-slate-500">{result.recommendedSpecialty}</div>
                <button
                  onClick={() => setCurrentPage('appointments')}
                  className="text-blue-700 dark:text-blue-400 hover:underline font-bold text-[11px] pt-1 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{t('buttons.bookAppointment')}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Applicable Scheme */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('auto.text_1029')}</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white truncate">
                  {result.applicableScheme || 'Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)'}
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-2">
                  {result.schemeBenefit || (t('auto.text_1033'))}
                </div>
                <button
                  onClick={() => setCurrentPage('schemes')}
                  className="text-purple-700 dark:text-purple-400 hover:underline font-bold text-[11px] pt-1 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{t('buttons.checkEligibility')}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
