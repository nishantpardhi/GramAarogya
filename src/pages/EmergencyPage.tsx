import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HealthDataService } from '../services/healthDataService';
import { DataUnavailableCard } from '../components/DataUnavailableCard';
import {
  PhoneCall,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

export const EmergencyPage: React.FC = () => {
  const { language, formatNumber, showToast,   emergencyRequests, submitEmergencyRequest } = useApp();
  const [sosTriggered, setSosTriggered] = useState(false);
  const [etaMinutes, setEtaMinutes] = useState(11);
  const [activeEmergencyType, setActiveEmergencyType] = useState<string>('snakebite');
  const [refreshKey, setRefreshKey] = useState(0);

  const emergencyResult = HealthDataService.getEmergencyStatus(  emergencyRequests);

  const handleSosClick = () => {
    setSosTriggered(true);
    submitEmergencyRequest({
      patientName: 'Emergency Citizen (Self)',
      mobile: '9822108108',
      emergencyType: 'Critical / 108 Dispatch',
      location: 'Ramtek Taluka, Nagpur District (GPS Tracked)',
      latitude: 21.3976,
      longitude: 79.3298,
    });
    showToast(
      language === 'mr'
        ? `१०८ आपत्कालीन रुग्णवाहिका पाठवण्यात आली आहे! ETA: ${formatNumber(11)} मिनिटे`
        : language === 'hi'
        ? `108 आपातकालीन एम्बुलेंस रवाना कर दी गई है! ETA: ${formatNumber(11)} मिनट`
        : '108 Emergency Ambulance Dispatched! ETA: 11 mins'
    );
  };

  const emergencyGuides: Record<
    string,
    { title: string; titleMr: string; titleHi: string; steps: string[]; stepsMr: string[]; stepsHi: string[] }
  > = {
    snakebite: {
      title: 'Snakebite Emergency (First-Aid Protocol)',
      titleMr: 'शेतात साप चावल्यास काय करावे व काय करू नये:',
      titleHi: 'खेत में सांप काटने पर क्या करें और क्या न करें:',
      steps: [
        'Keep the victim calm and still; do NOT let them run or walk.',
        'Immobilize the bitten limb with a splint/cloth below heart level.',
        'Remove rings, bangles, or tight clothing near the bite.',
        'NEVER cut, suck venom, apply tourniquet, or use fake stones/herbs.',
        'Rush immediately to the nearest PHC equipped with Anti-Snake Venom (ASV).',
      ],
      stepsMr: [
        'रुग्णाला शांत ठेवा व धावू किंवा चालू देऊ नका, जेणेकरून विष शरीरात वेगाने पसरणार नाही.',
        'चावलेला भाग (हात/पाय) हृदयाच्या पातळीखाली ठेवून स्थिर करा.',
        'चावलेल्या जागी घट्ट दोरी किंवा कापड बांधू नका; अंगठी किंवा बांगड्या काढून ठेवा.',
        'चावलेल्या जागी कापू नका, तोंड लावून विष ओढू नका, आणि मांत्रिक किंवा वैद्याकडे वेळ वाया घालवू नका.',
        'तातडीने जवळच्या प्राथमिक आरोग्य केंद्रात (PHC) घेऊन जा, जेथे मोफत सर्पदंश विरोधी लस (ASV) उपलब्ध आहे.',
      ],
      stepsHi: [
        'मरीज को शांत रखें और भागने या चलने न दें ताकि विष शरीर में तेजी से न फैले।',
        'काटे गए अंग को हृदय के स्तर से नीचे रखकर स्थिर करें।',
        'काटे गए स्थान पर कसकर रस्सी या कपड़ा न बांधें; अंगूठी या कड़े उतार दें।',
        'घाव पर चीरा न लगाएं, मुंह से जहर न चूसें और झाड़-फूंक में समय बर्बाद न करें।',
        'तुरंत निकटतम प्राथमिक स्वास्थ्य केंद्र (PHC) ले जाएं जहां एंटी-स्नेक वेनम (ASV) उपलब्ध है।',
      ],
    },
    cardiac: {
      title: 'Heart Attack & Chest Pain Emergency Protocol',
      titleMr: 'छातीत तीव्र दुखणे किंवा हृदयविकाराचा झटका:',
      titleHi: 'सीने में तेज दर्द या दिल का दौरा:',
      steps: [
        'Make the patient sit in a half-reclined resting position.',
        'Loosen tight clothing around chest and neck.',
        'If conscious and not allergic, give Aspirin 300mg / Sorbitrate 5mg if prescribed.',
        'Call 108 ambulance immediately.',
        'If unconscious and not breathing normally, begin Hands-only CPR at 100-120 beats/min.',
      ],
      stepsMr: [
        'रुग्णाला जमिनीवर किंवा खुर्चीवर रेलून शांत बसवा.',
        'गळ्याभोवतीचे घट्ट कपडे सैल करा.',
        'उपलब्ध असल्यास व डॉक्टरांचा सल्ला असल्यास एस्पिरिन ३००mg / सॉर्बिट्रेट द्या.',
        'तातडीने १०८ वर फोन करा.',
        'रुग्ण बेशुद्ध पडल्यास व श्वास थांबल्यास त्वरित छातीवर दोन्ही हातांनी सीपीआर (CPR) सुरू करा.',
      ],
      stepsHi: [
        'मरीज को आरामदेह स्थिति में बैठाएं और शांत रखें।',
        'सीने और गर्दन के आसपास के तंग कपड़े ढीले करें।',
        'यदि डॉक्टर का परामर्श हो तो एस्पिरिन 300mg / सॉर्बिट्रेट दें।',
        'तुरंत 108 एम्बुलेंस को कॉल करें।',
        'यदि मरीज बेहोश हो और सांस न ले रहा हो, तो तुरंत सीपीआर (CPR) शुरू करें।',
      ],
    },
    stroke: {
      title: 'Brain Stroke - FAST Protocol',
      titleMr: 'पक्षाघात ओळखण्याची FAST पद्धत:',
      titleHi: 'स्ट्रोक पहचानने का FAST तरीका:',
      steps: [
        'Face: Check if one side of the face is drooping.',
        'Arms: Ask them to raise both arms; see if one arm drifts downward.',
        'Speech: Check if speech is slurred or strange.',
        'Time: Time is brain! Reach a District Hospital / Medical College with CT Scan immediately within 4.5 hours.',
      ],
      stepsMr: [
        'चेहरा (Face): चेहऱ्याचा एका बाजूचा भाग वाकडा झाला आहे का ते पहा.',
        'हात (Arms): दोन्ही हात वर करण्यास सांगा; एक हात खाली पडतोय का?',
        'बोलणे (Speech): बोलण्यात बोबडेपणा किंवा अडखळणे येत आहे का?',
        'वेळ (Time): साडेचार तासांच्या आत सीटी स्कॅन सुविधा असलेल्या जिल्हा रुग्णालयात पोहोचा.',
      ],
      stepsHi: [
        'चेहरा (Face): देखें कि क्या चेहरे का एक हिस्सा झुक गया है।',
        'हाथ (Arms): दोनों हाथ उठाने को कहें; क्या एक हाथ नीचे गिर रहा है?',
        'बोली (Speech): क्या आवाज लड़खड़ा रही है या अस्पष्ट है?',
        'समय (Time): 4.5 घंटे के भीतर CT स्कैन सुविधा वाले जिला अस्पताल पहुंचें।',
      ],
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      {/* Top Red SOS Emergency Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-rose-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-black bg-rose-950 px-3 py-1 rounded-full border border-rose-500 animate-pulse">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>
              {language === 'mr'
                ? '२४x७ महाराष्ट्र शासन आपत्कालीन प्रतिसाद'
                : language === 'hi'
                ? '24x7 महाराष्ट्र शासन आपातकालीन सेवा'
                : '24x7 Maharashtra Emergency Response'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black">
            {language === 'mr'
              ? '१०८ आपत्कालीन रुग्णवाहिका व तातडीची वैद्यकीय मदत'
              : language === 'hi'
              ? '108 आपातकालीन एम्बुलेंस व तत्काल चिकित्सा सहायता'
              : '108 Emergency Ambulance & Critical Care SOS'}
          </h1>

          <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
            {language === 'mr'
              ? 'सर्पदंश, हृदयविकार, अपघात, प्रसूती किंवा गंभीर आजारासाठी एका क्लिकवर GPS द्वारे सर्वात जवळची १०८ रुग्णवाहिका तात्काळ रवाना केली जाते.'
              : language === 'hi'
              ? 'सर्पदंश, हृदय रोग, दुर्घटना, प्रसव या गंभीर स्थिति के लिए एक क्लिक पर GPS द्वारा निकटतम 108 एम्बुलेंस तुरंत रवाना की जाती है।'
              : 'Instant GPS dispatch of nearest 108 Life Support Ambulance and real-time Anti-Snake Venom stock routing.'}
          </p>

          {/* SOS 1-Click Trigger Button */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={handleSosClick}
              className="px-6 py-4 rounded-2xl bg-white hover:bg-rose-50 text-rose-800 font-black text-sm sm:text-base shadow-2xl transition-all active:scale-95 flex items-center gap-3 border-2 border-rose-300 cursor-pointer"
            >
              <PhoneCall className="w-6 h-6 text-rose-600 animate-bounce" />
              <span>
                {language === 'mr'
                  ? '१०८ रुग्णवाहिका बोलवा (DISPATCH SOS)'
                  : language === 'hi'
                  ? '108 एम्बुलेंस बुलाएं (DISPATCH SOS)'
                  : 'DISPATCH 108 AMBULANCE NOW'}
              </span>
            </button>

            <a
              href="tel:108"
              className="px-5 py-4 rounded-2xl bg-rose-950/80 hover:bg-rose-950 text-white font-black text-sm border border-rose-600 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-5 h-5" />
              <span>{language === 'mr' ? 'थेट फोन करा: १०८' : language === 'hi' ? 'सीधा कॉल: 108' : 'Direct Call: 108'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Data Source Transparency Banner */}

      {!emergencyResult.isAvailable ? (
        <DataUnavailableCard
          sourceName={
            language === 'mr'
              ? 'महाराष्ट्र १०८ संगणकीकृत डिस्पॅच (CAD) नेटवर्क'
              : language === 'hi'
              ? 'महाराष्ट्र 108 कम्प्यूटरीकृत डिस्पैच नेटवर्क'
              : 'Maharashtra 108 Computer-Aided Dispatch (CAD) Fleet Gateway'
          }
          requiredEndpoint="https://ems108.maharashtra.gov.in/api/v1/cad/dispatch"
        />
      ) : (
        <>
          {/* Dispatched Ambulance Tracking Card (Appears on click) */}
          {sosTriggered && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-rose-500 shadow-2xl p-6 space-y-4 animate-fade-in relative overflow-hidden">
              {emergencyResult.isDemoData && (
                <div className="absolute top-0 right-0 bg-amber-500/15 text-amber-800 dark:text-amber-300 font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-bl-lg border-b border-l border-amber-400/30">
                  DEMO DISPATCH
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    {language === 'mr'
                      ? 'रुग्णवाहिका मार्गावर आहे (Ambulance En Route)'
                      : language === 'hi'
                      ? 'एम्बुलेंस रास्ते में है (Ambulance En Route)'
                      : '108 Ambulance Dispatched & En Route'}
                  </h3>
                </div>
                <span className="text-xs font-bold bg-rose-100 text-rose-800 px-3 py-1 rounded-full">
                  {language === 'mr'
                    ? `अंदाजे वेळ: ${formatNumber(etaMinutes)} मिनिटे`
                    : language === 'hi'
                    ? `अनुमानित समय: ${formatNumber(etaMinutes)} मिनट`
                    : `ETA: ${etaMinutes} mins`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1">
                  <div className="text-slate-500 font-semibold">
                    {language === 'mr' ? 'रुग्णवाहिका क्रमांक:' : language === 'hi' ? 'एम्बुलेंस संख्या:' : 'Vehicle Reg:'}
                  </div>
                  <div className="font-black text-slate-900 dark:text-white text-sm">MH-31-EM-1082 (ALS Life Support)</div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1">
                  <div className="text-slate-500 font-semibold">
                    {language === 'mr' ? 'चालक व ईएमटी अधिकारी:' : language === 'hi' ? 'चालक व पैरामेडिक:' : 'Driver & EMT Paramedic:'}
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">Sachin Patil (📞 9822108108)</div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1">
                  <div className="text-slate-500 font-semibold">
                    {language === 'mr' ? 'मूळ केंद्र (Base PHC):' : language === 'hi' ? 'मूल केंद्र (Base PHC):' : 'Base Station:'}
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">PHC Ramtek Emergency Wing</div>
                </div>
              </div>
            </div>
          )}

          {/* Emergency First-Aid Guidelines for Rural Conditions */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {language === 'mr'
                    ? 'ग्रामीण आणीबाणी प्रथमोपचार मार्गदर्शक'
                    : language === 'hi'
                    ? 'ग्रामीण आपातकालीन प्राथमिक उपचार निर्देश'
                    : 'Rural Emergency First-Aid Protocols'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'mr'
                    ? 'रुग्णवाहिका येईपर्यंत काय करावे व काय टाळावे याबद्दल वैद्यकीय नियम'
                    : language === 'hi'
                    ? 'एम्बुलेंस आने तक क्या करें और क्या न करें के नियम'
                    : 'Crucial do’s and don’ts while waiting for ambulance arrival.'}
                </p>
              </div>

              {/* Protocol Toggle Buttons */}
              <div className="flex gap-2 text-xs font-bold">
                <button
                  onClick={() => setActiveEmergencyType('snakebite')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeEmergencyType === 'snakebite'
                      ? 'bg-rose-600 text-white shadow'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  🐍 {language === 'mr' ? 'सर्पदंश' : language === 'hi' ? 'सर्पदंश' : 'Snakebite'}
                </button>
                <button
                  onClick={() => setActiveEmergencyType('cardiac')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeEmergencyType === 'cardiac'
                      ? 'bg-rose-600 text-white shadow'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ❤️ {language === 'mr' ? 'हृदयविकार' : language === 'hi' ? 'दिल का दौरा' : 'Heart Attack'}
                </button>
                <button
                  onClick={() => setActiveEmergencyType('stroke')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeEmergencyType === 'stroke'
                      ? 'bg-rose-600 text-white shadow'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  🧠 {language === 'mr' ? 'पक्षाघात' : language === 'hi' ? 'स्ट्रोक' : 'Brain Stroke'}
                </button>
              </div>
            </div>

            {/* Selected Protocol Content */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {language === 'mr'
                  ? emergencyGuides[activeEmergencyType].titleMr
                  : language === 'hi'
                  ? emergencyGuides[activeEmergencyType].titleHi
                  : emergencyGuides[activeEmergencyType].title}
              </h4>

              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {(language === 'mr'
                  ? emergencyGuides[activeEmergencyType].stepsMr
                  : language === 'hi'
                  ? emergencyGuides[activeEmergencyType].stepsHi
                  : emergencyGuides[activeEmergencyType].steps
                ).map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
