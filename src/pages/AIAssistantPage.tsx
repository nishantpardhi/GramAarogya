import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import { apiClient } from '../services/apiClient';
import {
  Send,
  Globe,
  Mic,
  Bot,
  User,
  ShieldAlert,
  Loader2,
  PhoneCall,
  Building2,
  Stethoscope,
  Volume2,
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Compass,
  Info,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  Navigation,
} from 'lucide-react';

interface RecommendedDoctorInfo {
  id: string;
  name: string;
  nameMr?: string;
  nameHi?: string;
  specialization: string;
  specializationMr?: string;
  specializationHi?: string;
  qualification?: string;
  experienceYears?: number;
  consultationType?: string;
  availability: {
    hasRealtimeData: boolean;
    status: 'available' | 'with_patient' | 'busy' | 'unavailable' | 'off_duty';
    badgeColor: 'emerald' | 'amber' | 'slate';
    label: {
      mr: string;
      hi: string;
      en: string;
    };
    activeShift?: string;
    avgWaitTimeMinutes?: number;
  };
}

interface RecommendedFacilityInfo {
  facilityId: string;
  facilityName: string;
  officialNameMr?: string;
  officialNameHi?: string;
  officialName?: string;
  type: string;
  distanceKm: number;
  opdTiming: string;
  address?: string;
  contactNumber?: string;
  is24x7Emergency?: boolean;
  relevantDoctor: RecommendedDoctorInfo | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  source?: string;
  isEmergency?: boolean;
  emergencyGuidance?: string;
  reportedSymptoms?: string[];
  healthConcernSummary?: string;
  recommendedFacilities?: RecommendedFacilityInfo[];
  recommendedFacility?: any;
  recommendedDoctor?: any;
}

export const AIAssistantPage: React.FC = () => {
  const { language, setLanguage, formatTime, currentUser, setCurrentPage } = useApp();
  const [aiLang, setAiLang] = useState<Language>(language);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  // Health Concern Memory during consultation session
  const [sessionConcerns, setSessionConcerns] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sync AI language with app language initially
  useEffect(() => {
    setAiLang(language);
  }, [language]);

  // Initial welcome message based on selected AI language
  useEffect(() => {
    const welcomeTexts: Record<Language, string> = {
      mr: 'नमस्कार! मी ग्रामआरोग्य ‘आरोग्य नेव्हिगेशन सहाय्यक’ (Healthcare Navigation Assistant) आहे.\n\nमी कोणत्याही आजाराचे निदान करत नाही किंवा औषध/उपचार सुचवत नाही. मी आपल्या परिसरातील योग्य शासकीय प्राथमिक आरोग्य केंद्र (PHC), ग्रामीण रुग्णालय, ओपीडी वेळा आणि उपलब्ध तज्ज्ञ डॉक्टर शोधण्यात मदत करतो.\n\nतुम्हाला कोणती आरोग्य समस्या किंवा तपासणीबद्दल मदत हवी आहे?',
      hi: 'नमस्ते! मैं ग्रामआरोग्य ‘स्वास्थ्य नेविगेशन सहायक’ (Healthcare Navigation Assistant) हूँ।\n\nमैं किसी बीमारी का इलाज, पुष्टि या दवा नहीं देता। मैं आपके नजदीकी सरकारी प्राथमिक स्वास्थ्य केंद्र (PHC), ओपीडी समय और उपलब्ध डॉक्टरों को खोजने में आपकी सहायता करता हूँ।\n\nआप किस स्वास्थ्य समस्या या केंद्र के बारे में जानकारी चाहते हैं?',
      en: 'Hello! I am the GramAarogya Healthcare Navigation Assistant.\n\nI do not diagnose illnesses, prescribe medicines, or provide treatment plans. I help you navigate to nearby public health facilities (PHCs, CHCs, District Hospitals), view OPD timings, and discover available verified doctors.\n\nHow can I assist your healthcare navigation today?',
    };

    setMessages([
      {
        id: 'msg-welcome',
        sender: 'ai',
        text: welcomeTexts[aiLang],
        timestamp: formatTime(new Date()),
        source: 'GramAarogya Healthcare Navigation System',
      },
    ]);
  }, [aiLang, formatTime]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Setup Web Speech API for voice input
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = aiLang === 'mr' ? 'mr-IN' : aiLang === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        setIsRecording(false);
        handleSendMessage(transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [aiLang]);

  // Speech Synthesis for Audio Playback
  const speakText = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = aiLang === 'mr' ? 'mr-IN' : aiLang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);

    setIsSpeaking(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Pure Healthcare Navigation quick prompts (ZERO medical advice / ZERO treatment / ZERO diet)
  const quickPrompts: Record<Language, string[]> = {
    mr: [
      'मला ताप आणि अशक्तपणा आहे, जवळचे डॉक्टर शोधा',
      'मला टायफॉईडची शंका आहे, कोणती तपासणी करावी आणि कुठे जावे?',
      'छातीत तीव्र कळ आणि श्वास घेण्यास त्रास (तातडीची मदत)',
      'लहान बाळाला खोकला आहे, बालरोग तज्ज्ञ डॉक्टर कुठे भेटतील?',
      'नजीकचे २४x७ शासकीय रुग्णालय आणि ओपीडी वेळ काय आहे?',
      'गरोदरपणाच्या तपासणीसाठी स्त्रीरोग तज्ज्ञ डॉक्टर शोधा',
    ],
    hi: [
      'मुझे बुखार और कमजोरी है, नजदीकी डॉक्टर खोजें',
      'मुझे टाइफाइड की शंका है, कहां जांच करवानी चाहिए?',
      'सीने में तेज दर्द और सांस में तकलीफ (आपातकालीन मदद)',
      'छोटे बच्चे को खांसी है, बाल रोग विशेषज्ञ कहां मिलेंगे?',
      'निकटतम 24x7 सरकारी अस्पताल और ओपीडी का समय क्या है?',
      'गर्भावस्था जांच के लिए महिला डॉक्टर कहां उपलब्ध हैं?',
    ],
    en: [
      'I have fever and weakness, find nearby doctors',
      'I am concerned about typhoid, where can I get tested?',
      'Severe chest pain and difficulty breathing (Emergency)',
      'Child has a cough, where is a pediatrician available?',
      'Where is the nearest 24x7 government hospital & OPD timing?',
      'Where can I consult a gynecologist for pregnancy checkup?',
    ],
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: formatTime(new Date()),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await apiClient.sendChatMessage({
        message: query,
        language: aiLang,
        userId: currentUser?.id,
        userName: currentUser?.name,
        userRole: currentUser?.role,
        conversationHistory: messages.map((m) => ({
          sender: m.sender,
          text: m.text,
        })),
      });

      if (res && res.success) {
        const replyText =
          (res as any).reply ||
          (res as any).message ||
          (res as any).aiResponse ||
          (res.data as any)?.reply ||
          'उत्तर प्राप्त झाले नाही.';
        const isEmergency = Boolean((res as any).isEmergency || (res.data as any)?.isEmergency);
        const emergencyGuidance = (res as any).emergencyGuidance || (res.data as any)?.emergencyGuidance;
        const source = (res as any).source || (res.data as any)?.source || 'GramAarogya Healthcare Navigation Assistant';
        const recommendedFacilities =
          (res as any).recommendedFacilities ||
          (res.data as any)?.recommendedFacilities ||
          ((res as any).recommendedFacility ? [(res as any).recommendedFacility] : []);

        const reportedSymptoms: string[] =
          (res as any).reportedSymptoms || (res.data as any)?.reportedSymptoms || [];

        // Update consultation session memory
        if (reportedSymptoms.length > 0) {
          setSessionConcerns((prev) => {
            const set = new Set([...prev, ...reportedSymptoms]);
            return Array.from(set);
          });
        }

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: replyText,
          source,
          isEmergency,
          emergencyGuidance,
          reportedSymptoms,
          recommendedFacilities,
          recommendedFacility: (res as any).recommendedFacility || (res.data as any)?.recommendedFacility,
          recommendedDoctor: (res as any).recommendedDoctor || (res.data as any)?.recommendedDoctor,
          timestamp: formatTime(new Date()),
        };

        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(res?.error || 'Server error');
      }
    } catch (err: any) {
      console.warn('Backend chatbot API error:', err);
      const fallbackReplies: Record<Language, string> = {
        mr: 'माफ करा, नेव्हिगेशन सर्व्हरशी संपर्क करण्यात अडचण आली आहे. जवळच्या प्राथमिक आरोग्य केंद्राशी (PHC) संपर्क साधा किंवा तातडीच्या मदतीसाठी १०८ वर कॉल करा.',
        hi: 'क्षमा करें, सर्वर से संपर्क में समस्या आई है। कृपया नजदीकी प्राथमिक स्वास्थ्य केंद्र से संपर्क करें या 108 पर कॉल करें।',
        en: 'Unable to connect to healthcare server. Please visit your nearest Primary Health Centre or dial 108 for emergency services.',
      };

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: fallbackReplies[aiLang],
          timestamp: formatTime(new Date()),
          source: 'GramAarogya Safety Fallback',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = aiLang === 'mr' ? 'mr-IN' : aiLang === 'hi' ? 'hi-IN' : 'en-IN';
          recognitionRef.current.start();
          setIsRecording(true);
        } catch {
          simulateVoice();
        }
      } else {
        simulateVoice();
      }
    }
  };

  const simulateVoice = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      const voiceSamples: Record<Language, string> = {
        mr: 'मला गेल्या २ दिवसांपासून ताप आणि अशक्तपणा आहे, जवळचे डॉक्टर आणि दवाखाना शोधा.',
        hi: 'मुझे पिछले 2 दिनों से बुखार और कमजोरी है, नजदीकी डॉक्टर और अस्पताल खोजें।',
        en: 'I have fever and weakness since 2 days, please find nearby available doctors.',
      };
      const sample = voiceSamples[aiLang];
      setInputQuery(sample);
      handleSendMessage(sample);
    }, 1200);
  };

  const clearSessionMemory = () => {
    setSessionConcerns([]);
  };

  return (
    <div id="ai-assistant-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-left">
      {/* Header Banner with Language Switcher */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-emerald-500/30">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-900/80 px-3 py-1 rounded-full border border-emerald-500/40">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {aiLang === 'mr'
                ? 'आरोग्य नेव्हिगेशन सहाय्यक'
                : aiLang === 'hi'
                ? 'स्वास्थ्य नेविगेशन सहायक'
                : 'Healthcare Navigation Assistant'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] text-emerald-200 font-mono">DOCTOR DIRECTORY CONNECTED</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            {aiLang === 'mr'
              ? 'ग्रामआरोग्य आरोग्य नेव्हिगेशन व डॉक्टर शोध'
              : aiLang === 'hi'
              ? 'ग्रामआरोग्य स्वास्थ्य नेविगेशन एवं डॉक्टर खोज'
              : 'GramAarogya Healthcare Navigation Assistant'}
          </h1>

          <p className="text-xs sm:text-sm text-emerald-200 max-w-2xl">
            {aiLang === 'mr'
              ? 'आरोग्य केंद्रांचे अंतर, ओपीडी वेळा व उपलब्ध डॉक्टर शोधण्यासाठी सहाय्यक. (वैद्यकीय निदान किंवा उपचारांसाठी नव्हे)'
              : aiLang === 'hi'
              ? 'स्वास्थ्य केंद्रों की दूरी, ओपीडी समय और उपलब्ध डॉक्टरों को खोजने का सहायक। (निदान या इलाज का विकल्प नहीं)'
              : 'Assists in locating nearby public health centers, OPD hours, and real-time doctor availability. (Not for diagnosis or medical treatment)'}
          </p>
        </div>

        {/* Dedicated Language Selector */}
        <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex items-center space-x-1 self-stretch md:self-auto">
          <div className="px-2 text-xs font-bold text-slate-200 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{aiLang === 'mr' ? 'भाषा:' : aiLang === 'hi' ? 'भाषा:' : 'Language:'}</span>
          </div>

          <button
            onClick={() => {
              setAiLang('mr');
              setLanguage('mr');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              aiLang === 'mr' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            🇮🇳 मराठी
          </button>

          <button
            onClick={() => {
              setAiLang('hi');
              setLanguage('hi');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              aiLang === 'hi' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            🇮🇳 हिंदी
          </button>

          <button
            onClick={() => {
              setAiLang('en');
              setLanguage('en');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              aiLang === 'en' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            🌐 English
          </button>
        </div>
      </div>

      {/* Mandatory Medical Safety Directive Notice */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 rounded-2xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950 dark:text-amber-200 space-y-1">
            <div className="font-bold flex items-center gap-2">
              <span>
                {aiLang === 'mr'
                  ? 'महत्त्वाची वैद्यकीय सुरक्षा सूचना (The Health AI is NOT a Doctor):'
                  : aiLang === 'hi'
                  ? 'महत्वपूर्ण स्वास्थ्य सुरक्षा सूचना (The Health AI is NOT a Doctor):'
                  : 'Important Medical Safety Notice (The Health AI is NOT a Doctor):'}
              </span>
            </div>
            <p className="leading-relaxed">
              {aiLang === 'mr'
                ? 'हा AI सहाय्यक कोणत्याही आजाराचे निदान करत नाही, औषध किंवा मात्रा सुचवत नाही, आणि आहार/उपचार योजना देत नाही. रुग्ण सांगत असलेली लक्षणे केवळ योग्य आरोग्य केंद्र आणि उपलब्ध डॉक्टर शोधण्यासाठी नोंदवली जातात.'
                : aiLang === 'hi'
                ? 'यह AI सहायक किसी भी बीमारी की पुष्टि या निदान नहीं करता, न ही दवाएं या उपचार/डाइट प्लान देता है। मरीज द्वारा बताए गए लक्षण केवल उपयुक्त अस्पताल और उपलब्ध डॉक्टर खोजने में उपयोग किए जाते हैं।'
                : 'This AI does NOT diagnose diseases, confirm illnesses, prescribe medicines, or provide diet/treatment plans. Reported symptoms are only used to navigate to appropriate public health facilities and verified available doctors.'}
            </p>
          </div>
        </div>
      </div>

      {/* Health Concern Memory during consultation session */}
      {sessionConcerns.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {aiLang === 'mr'
                  ? 'नोंदवलेली आरोग्य लक्षणे (सध्याचे सत्र):'
                  : aiLang === 'hi'
                  ? 'दर्ज किए गए स्वास्थ्य लक्षण (वर्तमान सत्र):'
                  : 'Reported Health Concerns (Current Session):'}
              </span>
            </div>
            <button
              onClick={clearSessionMemory}
              className="text-[11px] text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1 font-medium transition-colors cursor-pointer"
              title="Clear session memory"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{aiLang === 'mr' ? 'नोंद साफ करा' : aiLang === 'hi' ? 'हटाएं' : 'Clear'}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {sessionConcerns.map((concern, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800/50"
              >
                • {concern}
              </span>
            ))}
          </div>

          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 italic">
            {aiLang === 'mr'
              ? 'हे केवळ योग्य आरोग्य केंद्र व डॉक्टर शोधण्यासाठी तात्पुरते वापरले जाते. गोपनीयतेसाठी संमतीशिवाय कायमस्वरूपी साठवले जात नाही.'
              : aiLang === 'hi'
              ? 'यह केवल उपयुक्त अस्पताल और डॉक्टर खोजने के लिए अस्थायी रूप से उपयोग होता है। बिना सहमति इसे स्थायी रूप से नहीं रखा जाता।'
              : 'Used solely to find suitable facilities and available doctors. Not permanently stored without consent.'}
          </p>
        </div>
      )}

      {/* Main Chat Container */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden flex flex-col h-[640px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-9 h-9 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow">
                  <Compass className="w-5 h-5" />
                </div>
              )}

              <div
                className={`max-w-[92%] sm:max-w-[82%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-tr-none font-medium shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-800 shadow-sm'
                }`}
              >
                {/* Emergency Safety Protocol Message */}
                {msg.isEmergency && (
                  <div className="mb-3.5 p-3.5 rounded-xl bg-rose-600 text-white font-bold space-y-2.5 shadow-md">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0 animate-bounce" />
                      <span className="text-xs sm:text-sm font-black">
                        {aiLang === 'mr'
                          ? 'यासाठी तातडीने वैद्यकीय उपचारांची आवश्यकता असू शकते.'
                          : aiLang === 'hi'
                          ? 'इसके लिए तत्काल चिकित्सा सहायता की आवश्यकता हो सकती है।'
                          : 'This may require urgent medical attention.'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href="tel:108"
                        className="px-3 py-1.5 rounded-lg bg-white text-rose-950 text-xs font-black flex items-center gap-1.5 shadow hover:bg-rose-50 transition-all cursor-pointer"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
                        <span>{aiLang === 'mr' ? '🚨 १०८ रुग्णवाहिका बोलवा' : aiLang === 'hi' ? '🚨 108 एम्बुलेंस बुलाएं' : '🚨 Call 108 Ambulance'}</span>
                      </a>

                      <button
                        onClick={() => setCurrentPage('emergency')}
                        className="px-3 py-1.5 rounded-lg bg-rose-800 text-white border border-white/30 text-xs font-extrabold flex items-center gap-1.5 shadow hover:bg-rose-900 transition-all cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5 text-rose-200" />
                        <span>{aiLang === 'mr' ? '🏥 नजीकचे २४x७ शासकीय केंद्र' : aiLang === 'hi' ? '🏥 निकटतम 24x7 आपातकालीन केंद्र' : '🏥 Nearest 24x7 Emergency Facility'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Message Body */}
                <div className="whitespace-pre-wrap font-sans text-slate-800 dark:text-slate-100">{msg.text}</div>

                {/* Recommended Healthcare Options Section */}
                {msg.recommendedFacilities && msg.recommendedFacilities.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {aiLang === 'mr'
                          ? 'शिफारस केलेले शासकीय आरोग्य पर्याय (Recommended Healthcare Options)'
                          : aiLang === 'hi'
                          ? 'अनुशंसित सरकारी स्वास्थ्य विकल्प (Recommended Healthcare Options)'
                          : 'Recommended Healthcare Options'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {msg.recommendedFacilities.map((fac, idx) => {
                        const doctor = fac.relevantDoctor;
                        const avail = doctor?.availability;
                        const facDisplayName =
                          aiLang === 'mr' ? fac.officialNameMr || fac.facilityName : fac.facilityName;
                        const docDisplayName =
                          aiLang === 'mr' ? doctor?.nameMr || doctor?.name : doctor?.name;
                        const docSpec =
                          aiLang === 'mr'
                            ? doctor?.specializationMr || doctor?.specialization
                            : doctor?.specialization;

                        return (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2.5"
                          >
                            {/* Facility Name & Type */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                                  <span>🏥 {facDisplayName}</span>
                                  {fac.is24x7Emergency && (
                                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                                      24x7
                                    </span>
                                  )}
                                </h4>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-emerald-600" />
                                    <span>
                                      {aiLang === 'mr' ? 'अंतर:' : 'Distance:'} {fac.distanceKm} km
                                    </span>
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span>OPD: {fac.opdTiming}</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Relevant Doctor & Real-Time Availability */}
                            {doctor && (
                              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                    <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                                    <span>👨‍⚕️ {docDisplayName}</span>
                                  </div>

                                  {/* Availability Badge */}
                                  <div>
                                    {avail?.hasRealtimeData ? (
                                      <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                          avail.status === 'available'
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                        }`}
                                      >
                                        {avail.label[aiLang] || avail.label.en}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                        {avail?.label[aiLang] ||
                                          (aiLang === 'mr'
                                            ? '⚪ सध्या उपलब्धतेची माहिती उपलब्ध नाही'
                                            : '⚪ Availability information is currently unavailable')}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                                  <span>🩺 {docSpec}</span>
                                  {avail?.activeShift && (
                                    <span className="ml-2 text-slate-500 font-mono">
                                      ({avail.activeShift})
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Action Buttons: [View Details] and [Book Appointment] */}
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setCurrentPage('facilities', { facilityId: fac.facilityId })
                                }
                                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                              >
                                {aiLang === 'mr'
                                  ? 'केंद्राची माहिती पहा'
                                  : aiLang === 'hi'
                                  ? 'अस्पताल विवरण'
                                  : 'View Details'}
                              </button>

                              {doctor && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCurrentPage('appointments', {
                                      doctorId: doctor.id,
                                      facilityId: fac.facilityId,
                                      reason: sessionConcerns.join(', '),
                                    })
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>
                                    {aiLang === 'mr'
                                      ? 'अपॉइंटमेंट बुक करा'
                                      : aiLang === 'hi'
                                      ? 'अपॉइंटमेंट बुक करें'
                                      : 'Book Appointment'}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Footer with Timestamp, Source, and TTS Audio Playback */}
                <div className="mt-3 flex items-center justify-between gap-2 text-[10px] opacity-70 border-t border-slate-200/50 dark:border-slate-800/50 pt-1.5">
                  <span className="font-mono">{msg.timestamp}</span>

                  <div className="flex items-center gap-2">
                    {msg.source && <span className="truncate max-w-[200px]">⚡ {msg.source}</span>}

                    {msg.sender === 'ai' && (
                      <button
                        type="button"
                        onClick={() => speakText(msg.text, msg.id)}
                        className={`p-1 rounded-md transition-colors cursor-pointer ${
                          isSpeaking === msg.id
                            ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100'
                            : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                        title={aiLang === 'mr' ? 'उत्तर ऐका (Listen)' : 'Listen to response'}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-9 h-9 rounded-2xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 shadow">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-9 h-9 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-2 border border-slate-200 dark:border-slate-800">
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>
                  {aiLang === 'mr'
                    ? 'आरोग्य केंद्र व डॉक्टरांची माहिती शोधत आहे...'
                    : aiLang === 'hi'
                    ? 'स्वास्थ्य केंद्र व डॉक्टरों की उपलब्धता जांची जा रही है...'
                    : 'Searching verified health facilities and doctor schedules...'}
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips (Navigation Focused) */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/70 border-t border-slate-200 dark:border-slate-700 overflow-x-auto flex gap-2 no-scrollbar">
          {quickPrompts[aiLang].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 transition-colors shrink-0 cursor-pointer shadow-2xs"
            >
              📍 {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar with Voice Input */}
        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Voice Mic Button */}
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse border-rose-700 shadow-md ring-4 ring-rose-500/30'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-200'
              }`}
              title={aiLang === 'mr' ? 'बोलून प्रश्न विचारा (Voice Input)' : 'Speak your question'}
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Input field */}
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                aiLang === 'mr'
                  ? 'तुमची लक्षणे किंवा समस्या येथे लिहा (उदा. मला ताप आणि अशक्तपणा आहे)...'
                  : aiLang === 'hi'
                  ? 'अपने लक्षण या समस्या यहाँ लिखें (जैसे मुझे बुखार व कमजोरी है)...'
                  : 'Describe your symptoms or healthcare need (e.g. fever and weakness)...'
              }
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm shadow flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{aiLang === 'mr' ? 'शोधा' : aiLang === 'hi' ? 'खोजें' : 'Search'}</span>
            </button>
          </form>

          {/* Safety Notice in Footer */}
          <div className="mt-2 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              {aiLang === 'mr'
                ? 'हा AI सहाय्यक केवळ शासकीय आरोग्य केंद्र व डॉक्टर शोधण्यासाठी आहे, वैद्यकीय उपचारांसाठी नव्हे. आणीबाणीत त्वरित १०८ वर कॉल करा.'
                : aiLang === 'hi'
                ? 'यह AI सहायक केवल अस्पताल व डॉक्टर खोजने के लिए है, इलाज या दवा के लिए नहीं। आपात स्थिति में 108 डायल करें।'
                : 'For healthcare facility & doctor navigation only. Not a medical doctor. In medical emergencies, dial 108.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
