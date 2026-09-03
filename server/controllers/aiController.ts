import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { db } from '../db/store';
import { calculateHaversineDistance } from '../services/locationService';
import { AuthRequest } from '../middleware/auth';

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Emergency Keywords Detection (Multilingual: Marathi, Hindi, English)
function detectEmergencyStatus(text: string): { isEmergency: boolean; urgencyType: string } {
  const lower = text.toLowerCase();
  const emergencyKeywords = [
    // Marathi
    'सर्पदंश', 'साप', 'विंचू', 'हृदयविकार', 'हार्ट अटॅक', 'छातीत कळ', 'छातीत दुखणे',
    'अपघात', 'रक्तस्त्राव', 'दम लागणे', 'श्वास घेण्यास त्रास', 'बेशुद्ध', 'पक्षाघात',
    'प्रसूती वेदना', 'बाळंतपण', 'विषबाधा', 'भाजणे', 'आचके', 'फिट येणे', 'रुग्णवाहिका',
    // Hindi
    'सांप', 'सर्पदंश', 'हार्ट अटैक', 'सीने में दर्द', 'दुर्घटना', 'खून बहना',
    'सांस लेने में तकलीफ', 'बेहोश', 'लकवा', 'प्रसव पीड़ा', 'जहर', 'जलना', 'दौरा', 'एम्बुलेंस',
    // English
    'emergency', 'heart attack', 'chest pain', 'snake bite', 'snakebite', 'scorpion',
    'accident', 'bleeding', 'unconscious', 'stroke', 'paralysis', 'labor pain',
    'delivery', 'poison', 'poisoning', 'burns', 'seizure', 'convulsion', 'suffocation',
    'difficulty breathing', 'shortness of breath', 'ambulance'
  ];

  for (const kw of emergencyKeywords) {
    if (lower.includes(kw) || text.includes(kw)) {
      return { isEmergency: true, urgencyType: kw };
    }
  }
  return { isEmergency: false, urgencyType: 'Routine' };
}

// Extract reported symptoms and health concerns without medical diagnosis
function extractReportedConcerns(text: string, language: 'mr' | 'hi' | 'en'): { reportedSymptoms: string[]; healthConcernSummary: string } {
  const lower = text.toLowerCase();
  const symptoms: string[] = [];

  // Typhoid concern check
  if (lower.includes('typhoid') || lower.includes('टायफॉईड') || lower.includes('टाइफाइड')) {
    symptoms.push(
      language === 'mr'
        ? 'टायफॉईड (रुग्णाने नोंदवलेली शंका)'
        : language === 'hi'
        ? 'टाइफाइड (मरीज द्वारा बताई गई चिंता)'
        : 'Typhoid (Patient-reported concern)'
    );
  }

  // Malaria / Dengue
  if (lower.includes('malaria') || lower.includes('मलेरिया')) {
    symptoms.push(
      language === 'mr' ? 'मलेरिया (नोंदवलेली शंका)' : language === 'hi' ? 'मलेरिया (संभावित चिंता)' : 'Malaria (Reported concern)'
    );
  }
  if (lower.includes('dengue') || lower.includes('डेंग्यू') || lower.includes('डेंगू')) {
    symptoms.push(
      language === 'mr' ? 'डेंग्यू (नोंदवलेली शंका)' : language === 'hi' ? 'डेंगू (संभावित चिंता)' : 'Dengue (Reported concern)'
    );
  }

  // Fever
  if (lower.includes('fever') || lower.includes('ताप') || lower.includes('बुखार') || lower.includes('थंडी')) {
    symptoms.push(language === 'mr' ? 'ताप (Fever)' : language === 'hi' ? 'बुखार (Fever)' : 'Fever');
  }

  // Weakness / Fatigue
  if (lower.includes('weakness') || lower.includes('अशक्तपणा') || lower.includes('कमजोरी') || lower.includes('थकवा') || lower.includes('थकान')) {
    symptoms.push(language === 'mr' ? 'अशक्तपणा व थकवा' : language === 'hi' ? 'कमजोरी व थकान' : 'Weakness / Fatigue');
  }

  // Headache
  if (lower.includes('headache') || lower.includes('डोकेदुखी') || lower.includes('डोके') || lower.includes('सिरदर्द') || lower.includes('सर दर्द')) {
    symptoms.push(language === 'mr' ? 'डोकेदुखी' : language === 'hi' ? 'सिरदर्द' : 'Headache');
  }

  // Cough / Cold
  if (lower.includes('cough') || lower.includes('खोकला') || lower.includes('खांसी') || lower.includes('cold') || lower.includes('सर्दी') || lower.includes('जुकाम')) {
    symptoms.push(language === 'mr' ? 'सर्दी व खोकला' : language === 'hi' ? 'सर्दी व खांसी' : 'Cough & Cold');
  }

  // Stomach / Abdominal pain
  if (lower.includes('stomach') || lower.includes('पोट') || lower.includes('पेट') || lower.includes('उलट्या') || lower.includes('उल्टी') || lower.includes('जुलाब') || lower.includes('दस्त')) {
    symptoms.push(language === 'mr' ? 'पोटाचा त्रास / उलटी' : language === 'hi' ? 'पेट दर्द / उल्टी' : 'Abdominal discomfort / Vomiting');
  }

  // Chest pain / Breathing
  if (lower.includes('chest') || lower.includes('छातीत') || lower.includes('सीने') || lower.includes('breath') || lower.includes('श्वास') || lower.includes('सांस')) {
    symptoms.push(language === 'mr' ? 'छातीत अस्वस्थता / श्वास घेण्यास त्रास' : language === 'hi' ? 'सीने में तकलीफ / सांस लेने में समस्या' : 'Chest discomfort / Breathing issue');
  }

  // Snakebite / Insect sting
  if (lower.includes('snake') || lower.includes('साप') || lower.includes('सर्पदंश') || lower.includes('विंचू') || lower.includes('सांप')) {
    symptoms.push(language === 'mr' ? 'सर्पदंश / कीटकदंश' : language === 'hi' ? 'सर्पदंश / डंक' : 'Snakebite / Venomous sting');
  }

  // Pregnancy / Maternal
  if (lower.includes('pregnancy') || lower.includes('गरोदर') || lower.includes('बाळंत') || lower.includes('गर्भवती') || lower.includes('प्रसूती')) {
    symptoms.push(language === 'mr' ? 'मातृ आरोग्य व गरोदरपण' : language === 'hi' ? 'मातृ स्वास्थ्य व गर्भावस्था' : 'Maternal Health & Pregnancy');
  }

  // Pediatrics / Child
  if (lower.includes('child') || lower.includes('baby') || lower.includes('लहान मूल') || lower.includes('बाळ') || lower.includes('बच्चा') || lower.includes('शिशु')) {
    symptoms.push(language === 'mr' ? 'शिशू व बाल आरोग्य' : language === 'hi' ? 'बाल स्वास्थ्य' : 'Child / Pediatric concern');
  }

  // Bones / Joint pain
  if (lower.includes('joint') || lower.includes('bone') || lower.includes('सांधेदुखी') || lower.includes('हाड') || lower.includes('जोड़ों') || lower.includes('हड्डी')) {
    symptoms.push(language === 'mr' ? 'सांधेदुखी / हाडांची दुखापत' : language === 'hi' ? 'जोड़ों का दर्द / हड्डी की चोट' : 'Joint pain / Orthopedic issue');
  }

  // Fallback if no specific matched keyword
  if (symptoms.length === 0) {
    const preview = text.length > 50 ? text.substring(0, 50) + '...' : text;
    symptoms.push(
      language === 'mr'
        ? `नोंदवलेली आरोग्य चिंता: "${preview}"`
        : language === 'hi'
        ? `दर्ज की गई स्वास्थ्य चिंता: "${preview}"`
        : `Reported concern: "${preview}"`
    );
  }

  const healthConcernSummary = symptoms.join(', ');
  return { reportedSymptoms: symptoms, healthConcernSummary };
}

// Build verified healthcare facilities and real doctor recommendations
function buildRecommendedHealthcareOptions(
  userLat: number,
  userLng: number,
  reportedSymptoms: string[],
  language: 'mr' | 'hi' | 'en'
) {
  const facilities = db.facilities || [];
  const doctors = db.doctors || [];
  const doctorAvailMap = db.doctorAvailability;

  // Calculate distances and sort
  const facilitiesWithDistance = facilities.map((f) => ({
    ...f,
    distanceKm: Number(calculateHaversineDistance(userLat, userLng, f.lat, f.lng).toFixed(1)),
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  // Pick the top 2-3 suitable facilities
  const selectedFacilities = facilitiesWithDistance.slice(0, 3);

  const results = selectedFacilities.map((fac) => {
    // Find verified doctor at this facility
    let relevantDoctor = doctors.find(
      (d) => d.facilityId === fac.id && d.verificationStatus === 'verified'
    );

    // If no direct doctor at this facility, fallback to matching general doctor or verified doctor
    if (!relevantDoctor) {
      relevantDoctor = doctors.find((d) => d.verificationStatus === 'verified') || doctors[0];
    }

    // Lookup real-time doctor availability from connected backend
    const availRecord = relevantDoctor ? doctorAvailMap.get(relevantDoctor.id) : null;

    let doctorAvailabilityInfo: {
      hasRealtimeData: boolean;
      status: 'available' | 'with_patient' | 'busy' | 'unavailable' | 'off_duty';
      badgeColor: 'emerald' | 'amber' | 'slate';
      label: { mr: string; hi: string; en: string };
      activeShift?: string;
      avgWaitTimeMinutes?: number;
    };

    if (availRecord && availRecord.status) {
      if (availRecord.status === 'available') {
        doctorAvailabilityInfo = {
          hasRealtimeData: true,
          status: 'available',
          badgeColor: 'emerald',
          label: {
            mr: '🟢 उपलब्ध',
            hi: '🟢 उपलब्ध',
            en: '🟢 Available',
          },
          activeShift: availRecord.activeShift,
          avgWaitTimeMinutes: availRecord.avgWaitTimeMinutes,
        };
      } else if (availRecord.status === 'with_patient') {
        doctorAvailabilityInfo = {
          hasRealtimeData: true,
          status: 'with_patient',
          badgeColor: 'amber',
          label: {
            mr: '🟡 काही वेळाने उपलब्ध (रुग्ण तपासणी सुरू)',
            hi: '🟡 कुछ देर में उपलब्ध (मरीज देख रहे हैं)',
            en: '🟡 Available Later',
          },
          activeShift: availRecord.activeShift,
          avgWaitTimeMinutes: availRecord.avgWaitTimeMinutes,
        };
      } else if (availRecord.status === 'busy') {
        doctorAvailabilityInfo = {
          hasRealtimeData: true,
          status: 'busy',
          badgeColor: 'amber',
          label: {
            mr: '🟡 व्यस्त (काही वेळाने उपलब्ध)',
            hi: '🟡 व्यस्त (कुछ देर में उपलब्ध)',
            en: '🟡 Available Later',
          },
          activeShift: availRecord.activeShift,
          avgWaitTimeMinutes: availRecord.avgWaitTimeMinutes,
        };
      } else {
        doctorAvailabilityInfo = {
          hasRealtimeData: true,
          status: 'off_duty',
          badgeColor: 'slate',
          label: {
            mr: '⚪ सध्या ड्युटीवर नाही',
            hi: '⚪ फिलहाल ड्यूटी पर नहीं',
            en: '⚪ Currently Off-Duty',
          },
          activeShift: availRecord.activeShift,
        };
      }
    } else {
      // Backend does not have verified real-time availability for this doctor
      doctorAvailabilityInfo = {
        hasRealtimeData: false,
        status: 'unavailable',
        badgeColor: 'slate',
        label: {
          mr: '⚪ सध्या उपलब्धतेची माहिती उपलब्ध नाही',
          hi: '⚪ उपलब्धता की जानकारी फिलहाल उपलब्ध नहीं है',
          en: '⚪ Availability information is currently unavailable',
        },
      };
    }

    // Clean OPD Timing string
    let opdTiming = fac.openHours || '09:00 AM - 02:00 PM';
    if (fac.type === 'PHC') {
      opdTiming = '10:00 AM – 02:00 PM';
    } else if (fac.type === 'CHC') {
      opdTiming = '09:00 AM – 04:00 PM';
    } else if (fac.type === 'District Hospital') {
      opdTiming = '08:30 AM – 04:30 PM (24x7 Emergency)';
    }

    return {
      facilityId: fac.id,
      facilityName: language === 'mr' ? fac.officialNameMr || fac.officialName : fac.officialName,
      officialNameMr: fac.officialNameMr,
      officialNameHi: fac.officialNameHi,
      officialName: fac.officialName,
      type: fac.type,
      distanceKm: fac.distanceKm,
      opdTiming,
      address: fac.address,
      contactNumber: fac.contactNumber,
      is24x7Emergency: Boolean(fac.is24x7Emergency),
      relevantDoctor: relevantDoctor
        ? {
            id: relevantDoctor.id,
            name: language === 'mr' ? relevantDoctor.nameMr || relevantDoctor.name : relevantDoctor.name,
            nameMr: relevantDoctor.nameMr,
            nameHi: relevantDoctor.nameHi,
            specialization: language === 'mr' ? relevantDoctor.specializationMr || relevantDoctor.specialization : relevantDoctor.specialization,
            specializationMr: relevantDoctor.specializationMr,
            specializationHi: relevantDoctor.specializationHi,
            qualification: relevantDoctor.qualification,
            experienceYears: relevantDoctor.experienceYears,
            consultationType: relevantDoctor.consultationType,
            availability: doctorAvailabilityInfo,
          }
        : null,
    };
  });

  return results;
}

// Pure healthcare navigation fallback response (ZERO MEDICAL TREATMENT / ZERO DIAGNOSIS)
function generateSafeNavigationResponse(
  message: string,
  language: 'mr' | 'hi' | 'en',
  isEmergency: boolean,
  reportedSymptoms: string[],
  recommendedOptions: any[]
): string {
  const lower = message.toLowerCase();
  const firstFac = recommendedOptions[0];
  const firstDoc = firstFac?.relevantDoctor;

  // 1. EMERGENCY SAFETY PROTOCOL
  if (isEmergency) {
    if (language === 'mr') {
      return `🚨 यासाठी तातडीने वैद्यकीय उपचारांची आवश्यकता असू शकते.\n\nमी कोणत्याही आजाराचे निदान किंवा वैद्यकीय उपचार करू शकत नाही. कृपया विलंब न करता मोफत १०८ रुग्णवाहिका बोलवा किंवा नजीकच्या २४x७ शासकीय आपत्कालीन केंद्रात दाखल व्हा.`;
    } else if (language === 'hi') {
      return `🚨 इसके लिए तत्काल चिकित्सा सहायता की आवश्यकता हो सकती है।\n\nमैं किसी बीमारी की पुष्टि या चिकित्सकीय उपचार नहीं कर सकता। कृपया बिना देर किए 108 एम्बुलेंस पर कॉल करें या तुरंत नजदीकी 24x7 सरकारी अस्पताल पहुंचें।`;
    } else {
      return `🚨 This may require urgent medical attention.\n\nI cannot confirm a diagnosis or provide medical treatment. Please call 108 Ambulance immediately or proceed to the nearest 24x7 government emergency healthcare facility.`;
    }
  }

  // 2. SPECIFIC DISEASE REPORTED (e.g. Typhoid, Malaria)
  if (lower.includes('typhoid') || lower.includes('टायफॉईड') || lower.includes('टाइफाइड')) {
    if (language === 'mr') {
      return `मी समजतो की तुम्हाला टायफॉईडबद्दल काळजी वाटत आहे. मी कोणत्याही आजाराचे निदान करू शकत नाही किंवा उपचार देऊ शकत नाही, परंतु मी तुम्हाला नजीकचे योग्य शासकीय आरोग्य केंद्र आणि उपलब्ध डॉक्टर शोधण्यात मदत करू शकतो.\n\nखालील आरोग्य केंद्रांची माहिती तपासून आपण तपासणीसाठी डॉक्टरांची भेट घेऊ शकता:`;
    } else if (language === 'hi') {
      return `मैं समझता हूँ कि आप टाइफाइड को लेकर चिंतित हैं। मैं किसी बीमारी की पुष्टि या इलाज नहीं कर सकता, लेकिन मैं आपको नजदीकी उपयुक्त स्वास्थ्य केंद्र और उपलब्ध डॉक्टर खोजने में मदद कर सकता हूँ।\n\nकृपया नीचे दिए गए केंद्रों में से उपयुक्त डॉक्टर का चयन करें:`;
    } else {
      return `I understand that you are concerned about typhoid. I cannot confirm a diagnosis or provide treatment, but I can help you find an appropriate nearby healthcare facility and available doctor.\n\nPlease review the recommended healthcare options below:`;
    }
  }

  // 3. GENERAL SYMPTOMS (Fever, Weakness, Cough, Headache, etc.)
  if (reportedSymptoms.length > 0) {
    const symptomsText = reportedSymptoms.join(', ');
    if (language === 'mr') {
      return `आपण नोंदवलेली आरोग्य लक्षणे (${symptomsText}) मी नोंदवून घेतली आहेत. मी वैद्यकीय उपचार किंवा औषध सुचवत नाही; अचूक तपासणीसाठी कृपया नजीकच्या प्राथमिक आरोग्य केंद्रातील (PHC) डॉक्टरांचा सल्ला घ्या. आपल्या सोयीसाठी जवळचे आरोग्य केंद्र व डॉक्टरांची माहिती खाली दिली आहे.`;
    } else if (language === 'hi') {
      return `आपके द्वारा बताए गए स्वास्थ्य लक्षण (${symptomsText}) दर्ज कर लिए गए हैं। मैं चिकित्सकीय उपचार या दवाएं नहीं दे सकता; सही जांच के लिए कृपया नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) के डॉक्टर से मिलें। उपलब्ध स्वास्थ्य केंद्र और डॉक्टरों की सूची नीचे दी गई है।`;
    } else {
      return `I have noted your reported symptoms (${symptomsText}). I cannot confirm a diagnosis or provide medical treatment, but I can help guide you to a qualified doctor at your nearest Primary Health Centre (PHC) for in-person evaluation.`;
    }
  }

  // 4. GENERAL NAVIGATION ASSISTANCE
  if (language === 'mr') {
    return `मी ग्रामआरोग्य आरोग्य नेव्हिगेशन सहाय्यक आहे. मी आजारांचे निदान किंवा उपचार करत नाही, परंतु आपल्या परिसरातील योग्य शासकीय आरोग्य केंद्र, ओपीडी वेळ आणि उपलब्ध डॉक्टर शोधण्यात मदत करतो.`;
  } else if (language === 'hi') {
    return `मैं ग्रामआरोग्य स्वास्थ्य नेविगेशन सहायक हूँ। मैं बीमारी का इलाज या दवा नहीं देता, लेकिन आपके नजदीकी सरकारी अस्पताल, ओपीडी समय और उपलब्ध डॉक्टरों को खोजने में आपकी मदद कर सकता हूँ।`;
  } else {
    return `I am the GramAarogya Healthcare Navigation Assistant. I do not diagnose illnesses or provide medical treatment, but I can help you find appropriate nearby public healthcare facilities, OPD timings, and available doctors.`;
  }
}

// Core Chatbot Handler (Client-Server Endpoint: POST /api/chat)
export const handleHealthChatbot = async (req: AuthRequest, res: Response) => {
  try {
    const rawMessage = req.body.message || req.body.query || req.body.text || '';
    const language = ((req.body.language || 'mr') as string).toLowerCase() as 'mr' | 'hi' | 'en';
    const conversationHistory = req.body.conversationHistory || [];
    const userLat = parseFloat(req.body.userLat || req.body.latitude || 21.3966);
    const userLng = parseFloat(req.body.userLng || req.body.longitude || 79.3274);
    const userId = req.user?.id || req.body.userId || 'citizen-user';
    const userName = req.user?.name || req.body.userName || 'नागरिक / Citizen';
    const userRole = req.user?.role || req.body.userRole || 'patient';

    if (!rawMessage || typeof rawMessage !== 'string' || rawMessage.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message text is required in request body.',
      });
    }

    const trimmedMsg = rawMessage.trim();
    console.log('Received user message:\n', trimmedMsg);

    // 1. Emergency Detection
    const { isEmergency, urgencyType } = detectEmergencyStatus(trimmedMsg);

    // 2. Health Concern / Symptoms Extraction (Memory during consultation session)
    const { reportedSymptoms, healthConcernSummary } = extractReportedConcerns(trimmedMsg, language);

    // 3. Healthcare Facilities and Doctor Search from backend database
    const recommendedFacilities = buildRecommendedHealthcareOptions(userLat, userLng, reportedSymptoms, language);
    const primaryFacility = recommendedFacilities[0] || null;
    const primaryDoctor = primaryFacility?.relevantDoctor || null;

    let replyText = '';

    // 4. Try Live Gemini API Generation with STRICT Healthcare Navigation Prompt
    const gemini = getGeminiClient();
    if (gemini) {
      try {
        const langName = language === 'mr' ? 'Marathi (मराठी)' : language === 'hi' ? 'Hindi (हिंदी)' : 'English';

        const systemPrompt = `You are "GramAarogya Healthcare Navigation Assistant" (ग्रामआरोग्य स्वास्थ्य नेव्हिगेशन सहाय्यक), a healthcare navigation AI for rural Maharashtra, India.

CRITICAL MEDICAL SAFETY DIRECTIVES:
1. YOU ARE NOT A DOCTOR. You must NEVER behave like a doctor.
2. ABSOLUTELY FORBIDDEN:
   - ❌ NEVER diagnose diseases.
   - ❌ NEVER confirm that a patient has typhoid, malaria, dengue, or ANY other disease (e.g. If patient says "I am suffering from typhoid", DO NOT say "You have typhoid". Treat it strictly as their reported concern: "I understand that you are concerned about typhoid. I cannot confirm a diagnosis or provide treatment, but I can help you find an appropriate nearby healthcare facility and available doctor.").
   - ❌ NEVER prescribe medicines or suggest dosages (NO paracetamol, antibiotics, etc.).
   - ❌ NEVER give treatment plans, therapies, or clinical remedies.
   - ❌ NEVER give diet plans, food suggestions, fluid intake recommendations, or ORS recipes.
   - ❌ NEVER tell the patient to "rest", "drink fluids", or "take ORS".
   - ❌ NEVER replace a qualified medical practitioner.

ROLE & BEHAVIOR:
1. Understand and record the patient's reported health concern with empathy.
2. State clearly and politely that you cannot diagnose or treat conditions, but can help navigate to qualified doctors and nearby public health facilities.
3. If necessary, ask at most ONE basic clarifying question (such as how many days the symptoms have lasted), without offering any treatment.
4. If the message describes an EMERGENCY (snakebite, heart attack, chest pain, stroke, heavy bleeding, accident, poisoning, seizure, severe breathing trouble, active labor):
   - Immediately output: "This may require urgent medical attention." (or in Marathi: "यासाठी तातडीने वैद्यकीय उपचारांची आवश्यकता असू शकते.", in Hindi: "इसके लिए तत्काल चिकित्सा सहायता की आवश्यकता हो सकती है।")
   - Guide them to immediately dial 108 Ambulance and reach the nearest 24x7 emergency hospital.
   - DO NOT attempt any medical treatment.

LANGUAGE RULE:
You MUST write your entire answer in ${langName}. Do NOT mix languages unnecessarily.
Keep the response under 80 words. Simple, reassuring, non-prescriptive, and focused purely on healthcare navigation.`;

        // Format conversation history
        const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

        if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
          for (const item of conversationHistory.slice(-4)) {
            const role = item.sender === 'user' ? 'user' : 'model';
            const textContent = (item.text || item.message || '').trim();
            if (textContent && !textContent.startsWith('नमस्कार! मी ‘ग्रामआरोग्य')) {
              contents.push({
                role,
                parts: [{ text: textContent }],
              });
            }
          }
        }

        contents.push({
          role: 'user',
          parts: [{ text: trimmedMsg }],
        });

        // Use gemini-3.8-flash as specified by Gemini API guidelines
        const aiResponse = await gemini.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.2,
          },
        });

        const generated = (aiResponse.text || '').trim();
        if (generated) {
          replyText = generated;
        }
      } catch (geminiError: any) {
        console.warn('Gemini API navigation warning:', geminiError?.message || geminiError);
      }
    }

    // 5. Fallback to Safe Navigation Response if Gemini was unavailable or empty
    if (!replyText) {
      replyText = generateSafeNavigationResponse(
        trimmedMsg,
        language,
        isEmergency,
        reportedSymptoms,
        recommendedFacilities
      );
    }

    console.log('AI Navigation response:\n', replyText);

    return res.json({
      success: true,
      reply: replyText,
      message: replyText,
      response: replyText,
      aiResponse: replyText,
      source: 'GramAarogya Healthcare Navigation Assistant',
      triageLevel: isEmergency ? 'CRITICAL_EMERGENCY' : 'HEALTHCARE_NAVIGATION',
      isEmergency,
      urgency: isEmergency ? 'Emergency' : 'Routine',
      emergencyGuidance: isEmergency
        ? language === 'mr'
          ? 'तातडीची आणीबाणी: कृपया त्वरित १०८ रुग्णवाहिकेशी संपर्क साधा किंवा नजीकच्या २४x७ शासकीय रुग्णालयात जा.'
          : language === 'hi'
          ? 'आपातकालीन सहायता: कृपया तुरंत 108 एम्बुलेंस से संपर्क करें या निकटतम 24x7 सरकारी अस्पताल जाएं।'
          : 'EMERGENCY: Please call 108 Ambulance immediately or proceed to the nearest 24x7 emergency medical facility.'
        : undefined,
      reportedSymptoms,
      healthConcernSummary,
      recommendedFacilities,
      // Retain backwards-compatibility aliases
      recommendedFacility: primaryFacility,
      matchedFacilityName: primaryFacility?.facilityName,
      recommendedDoctor: primaryDoctor,
      matchedDoctorName: primaryDoctor?.name,
      language,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Server navigation chatbot error:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while navigating healthcare options.',
      details: error.message,
    });
  }
};

// Aliases for compatibility
export const queryAiNavigator = handleHealthChatbot;
export const queryAiAssistant = handleHealthChatbot;
export const handleHealthAssistant = handleHealthChatbot;

