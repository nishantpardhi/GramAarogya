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

  // Skin / Rash / Allergy
  if (lower.includes('skin') || lower.includes('rash') || lower.includes('itching') || lower.includes('पुरळ') || lower.includes('खाज') || lower.includes('खुजली') || lower.includes('दाद') || lower.includes('त्वचा')) {
    symptoms.push(language === 'mr' ? 'त्वचारोग व खाज / पुरळ' : language === 'hi' ? 'त्वचा रोग / खुजली' : 'Skin rash / Dermatological issue');
  }

  // Eye issues
  if (lower.includes('eye') || lower.includes('vision') || lower.includes('डोळे') || lower.includes('आँख') || lower.includes('जळजळ')) {
    symptoms.push(language === 'mr' ? 'नेत्रविकार / डोळ्यांची जळजळ' : language === 'hi' ? 'आंखों की समस्या' : 'Eye discomfort / Ophthalmology concern');
  }

  // Dizziness / Vertigo
  if (lower.includes('dizz') || lower.includes('giddi') || lower.includes('चक्कर') || lower.includes('भोवळ')) {
    symptoms.push(language === 'mr' ? 'चक्कर येणे / भोवळ' : language === 'hi' ? 'चक्कर आना' : 'Dizziness / Vertigo');
  }

  // Throat / Sore throat
  if (lower.includes('throat') || lower.includes('घसा') || lower.includes('गळा') || lower.includes('गले')) {
    symptoms.push(language === 'mr' ? 'घसादुखी / खवखव' : language === 'hi' ? 'गले में खराश / दर्द' : 'Sore throat / Throat irritation');
  }

  // Diabetes / Hypertension / BP
  if (lower.includes('sugar') || lower.includes('diabetes') || lower.includes('मधुमेह') || lower.includes('रक्तदाब') || lower.includes('bp') || lower.includes('बीपी')) {
    symptoms.push(language === 'mr' ? 'मधुमेह व रक्तदाब तपासणी' : language === 'hi' ? 'शुगर एवं बीपी जांच' : 'Diabetes / Blood Pressure evaluation');
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

// Pure healthcare navigation fallback response (ZERO MEDICAL ADVICE / ZERO MEDICINE / STRICT SYMPTOM & DOCTOR NAVIGATION)
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
  const docName = language === 'mr' ? firstDoc?.nameMr || firstDoc?.name : firstDoc?.name;
  const docSpec = language === 'mr' ? firstDoc?.specializationMr || firstDoc?.specialization : firstDoc?.specialization;
  const facName = language === 'mr' ? firstFac?.officialNameMr || firstFac?.facilityName : firstFac?.facilityName;

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

  // 2. SPECIFIC DISEASE CONCERN REPORTED (e.g. Typhoid, Malaria)
  if (lower.includes('typhoid') || lower.includes('टायफॉईड') || lower.includes('टाइफाइड') || lower.includes('malaria') || lower.includes('मलेरिया')) {
    if (language === 'mr') {
      return `मी आपली आरोग्य चिंता समजून घेतली आहे. मी वैद्यकीय सल्ला किंवा औषध देऊ शकत नाही. आपल्या लक्षणांचे अचूक निदान करण्यासाठी कृपया ${firstDoc ? `${docName} (${docSpec}), ${facName} (ओपीडी: ${firstFac?.opdTiming})` : facName} यांची प्रत्यक्ष तपासणीसाठी भेट घ्या.`;
    } else if (language === 'hi') {
      return `मैंने आपकी स्वास्थ्य समस्या नोट कर ली है। मैं कोई स्वास्थ्य सलाह या दवा नहीं दे सकता। आपकी समस्या के सही निदान के लिए कृपया ${firstDoc ? `${docName} (${docSpec}), ${facName} (OPD: ${firstFac?.opdTiming})` : facName} से संपर्क करें, जो आपकी जांच कर रोग का निदान करेंगे।`;
    } else {
      return `I have noted your reported health concern. I cannot provide health advice or medicines. To diagnose the problem you are facing, please consult ${firstDoc ? `${docName} (${docSpec}) at ${facName} (OPD: ${firstFac?.opdTiming})` : facName} for clinical examination and diagnosis.`;
    }
  }

  // 3. GENERAL SYMPTOMS REPORTED (Fever, Weakness, Cough, Headache, etc.)
  if (reportedSymptoms.length > 0) {
    const symptomsText = reportedSymptoms.join(', ');
    if (language === 'mr') {
      return `मी आपण नोंदवलेली लक्षणे (${symptomsText}) नोंदवून घेतली आहेत. मी कोणताही वैद्यकीय सल्ला किंवा औषध देऊ शकत नाही. या लक्षणांचे योग्य निदान करण्यासाठी कृपया ${firstDoc ? `${docName} (${docSpec}), ${facName} (ओपीडी: ${firstFac?.opdTiming}, अंतर: ${firstFac?.distanceKm} किमी)` : facName} यांच्याकडे जाऊन प्रत्यक्ष तपासणी करून घ्या.`;
    } else if (language === 'hi') {
      return `मैंने आपके बताए गए लक्षण (${symptomsText}) दर्ज कर लिए हैं। मैं कोई स्वास्थ्य सलाह या दवा नहीं दे सकता। इन लक्षणों के सही निदान के लिए कृपया ${firstDoc ? `${docName} (${docSpec}), ${facName} (OPD: ${firstFac?.opdTiming}, दूरी: ${firstFac?.distanceKm} किमी)` : facName} से संपर्क करें, जो आपकी जांच कर समस्या का निदान करेंगे।`;
    } else {
      return `I have read your reported symptoms (${symptomsText}). I cannot provide health advice or medicine. To diagnose the problem you are facing, please consult ${firstDoc ? `${docName} (${docSpec}) at ${facName} (OPD: ${firstFac?.opdTiming}, Distance: ${firstFac?.distanceKm} km)` : facName} for a clinical diagnosis.`;
    }
  }

  // 4. GENERAL NAVIGATION ASSISTANCE
  if (language === 'mr') {
    return `मी ग्रामआरोग्य आरोग्य नेव्हिगेशन सहाय्यक आहे. मी वैद्यकीय सल्ला किंवा औषध देत नाही. आपण आपली लक्षणे सांगितल्यास त्या समस्येचे निदान करण्यासाठी उपलब्ध शासकीय रुग्णालय आणि डॉक्टरांची माहिती मी देऊ शकतो.`;
  } else if (language === 'hi') {
    return `मैं ग्रामआरोग्य स्वास्थ्य नेविगेशन सहायक हूँ। मैं स्वास्थ्य सलाह या दवा नहीं देता। आप अपने लक्षण बताएं, मैं आपकी समस्या के निदान हेतु उपलब्ध सरकारी अस्पताल और डॉक्टर की जानकारी प्रदान करूंगा।`;
  } else {
    return `I am the GramAarogya Healthcare Navigation Assistant. I never provide health advice or medicine. Please describe the symptoms you are facing, and I will provide the nearby hospitals and doctors available to diagnose your problem.`;
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

        // Prepare verified facilities and doctors text to feed into Gemini prompt
        const facilityListSummary = recommendedFacilities
          .map((f, i) => {
            const doc = f.relevantDoctor;
            const docName = language === 'mr' ? doc?.nameMr || doc?.name : doc?.name;
            const docSpec = language === 'mr' ? doc?.specializationMr || doc?.specialization : doc?.specialization;
            const facName = language === 'mr' ? f.officialNameMr || f.facilityName : f.facilityName;
            return `Option ${i + 1}: ${facName} (${f.type}, Distance: ${f.distanceKm} km, OPD: ${f.opdTiming})${
              doc ? ` - Doctor: ${docName} (${docSpec})` : ''
            }`;
          })
          .join('\n');

        const systemPrompt = `You are "GramAarogya Healthcare Navigation Assistant" (ग्रामआरोग्य स्वास्थ्य नेव्हिगेशन सहाय्यक) powered by Gemini, designed for rural Maharashtra healthcare navigation.

YOUR SPECIFIED, STRICT TASK:
You are trained solely for ONE specific task:
1. READ THE SYMPTOMS: Read and identify the symptoms or health concerns reported by the patient.
2. NEVER RECOMMEND HEALTH ADVICE OR MEDICINE:
   - ❌ You can NEVER recommend any health advice, home remedies, rest advice, fluid/diet intake, or exercises.
   - ❌ You can NEVER recommend, suggest, or mention ANY medicine or drugs (NO paracetamol, antibiotics, painkillers, syrups, or dosages).
   - ❌ You can NEVER diagnose the disease yourself or confirm an illness (do NOT say "You have typhoid" or "You have malaria").
3. ONLY GIVE THE HOSPITAL AND DOCTOR TO DIAGNOSE THE PROBLEM PATIENT IS FACING:
   - State that proper clinical examination by a qualified doctor is required to diagnose these symptoms.
   - Give the specific verified hospital(s) and doctor(s) from the list below who are available to diagnose the problem the patient is facing.
   - Mention the doctor's name, specialization, hospital name, OPD hours, and distance.

VERIFIED GOVERNMENT HOSPITALS & DOCTORS AVAILABLE TO DIAGNOSE THE PATIENT:
${facilityListSummary || '1. Primary Health Centre (PHC) Ramtek - Dr. Rameshwar Deshmukh (Medical Officer, OPD: 10:00 AM - 02:00 PM)\n2. Sub-District Hospital Katol - Dr. Snehal Patil (Medical Officer, OPD: 09:00 AM - 04:00 PM)'}

EMERGENCY PROTOCOL:
If the symptoms indicate an emergency (severe chest pain, stroke, snakebite, unconsciousness, heavy bleeding, acute breathlessness):
- Immediately instruct dialing 108 Ambulance and going to the nearest 24x7 emergency hospital without delay.
- DO NOT provide any medical advice or medicine.

OUTPUT RULES:
- Format your response EXACTLY like this:
  {advice}
  
  [Clinical Summary: {summary}]
- Where {advice} is the plain-language advice in ${langName}, keeping it concise.
- And {summary} is a clinical summary of the patient's reported symptoms and concerns, written strictly in standard English for doctor handoff.
- Acknowledge the symptoms. State that you do not provide health advice and a doctor's examination is needed. Give the recommended hospital and doctor.`;

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

        // Candidate models with graceful fallback for high demand (503) or rate limits
        const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

        for (const modelName of candidateModels) {
          try {
            const aiResponse = await gemini.models.generateContent({
              model: modelName,
              contents,
              config: {
                systemInstruction: systemPrompt,
                temperature: 0.2,
              },
            });

            const generated = (aiResponse.text || '').trim();
            if (generated) {
              replyText = generated;
              break;
            }
          } catch (geminiError: any) {
            // Graceful handling of high demand (503), rate limit (429), or temporary outages
            const errorMsg = geminiError?.message || '';
            const isHighDemand =
              geminiError?.status === 503 ||
              errorMsg.includes('503') ||
              errorMsg.includes('high demand') ||
              geminiError?.status === 'UNAVAILABLE';

            if (isHighDemand) {
              console.info(`Gemini model ${modelName} experiencing temporary high demand; checking fallback model...`);
            } else {
              console.info(`Gemini model ${modelName} notice; checking next available option...`);
            }
          }
        }
      } catch (outerErr: any) {
        console.info('AI navigation handler fallback active:', outerErr?.message || 'Local navigation fallback');
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

