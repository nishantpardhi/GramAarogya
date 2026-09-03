import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AskGramAarogya } from '../components/AskGramAarogya';
import { HealthcareMap } from '../components/HealthcareMap';
import {
  Building2,
  Stethoscope,
  Calendar,
  PhoneCall,
  FileText,
  ShieldCheck,
  Pill,
  Megaphone,
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
  HeartPulse,
  Baby,
  Syringe,
  Search,
  Map as MapIcon,
  LayoutGrid,
  Phone,
  LogIn,
  User,
  Lock,
  Truck,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const {
    currentUser,
    language,
    t,
    formatNumber,
    formatDistance,
    setCurrentPage,
    facilities,
    healthCamps,
  } = useApp();

  const [nearbyViewMode, setNearbyViewMode] = useState<'cards' | 'map'>('cards');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [facilitySearch, setFacilitySearch] = useState<string>('');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  // Filter facilities for "Healthcare Near You"
  const filteredFacilities = (facilities || []).filter((f) => {
    if (!f) return false;
    const q = (facilitySearch || '').trim().toLowerCase();
    const matchesSearch =
      !q ||
      (f.name || '').toLowerCase().includes(q) ||
      (f.nameMr || '').includes(facilitySearch || '') ||
      (f.taluka || '').toLowerCase().includes(q);
    const matchesDistrict = selectedDistrict === 'ALL' || f.district === selectedDistrict;
    return matchesSearch && matchesDistrict;
  });

  // 9 Quick Action Cards
  const quickActions = [
    {
      id: 'facilities',
      title: language === 'mr' ? 'जवळचे PHC / रुग्णालय' : language === 'hi' ? 'निकटतम PHC / अस्पताल' : 'Find Nearby PHC / Hospital',
      desc:
        language === 'mr'
          ? 'जवळची शासकीय आरोग्य केंद्रे व खाटांची उपलब्धता शोधा'
          : language === 'hi'
          ? 'निकटतम सरकारी स्वास्थ्य केंद्र व बिस्तरों की उपलब्धता खोजें'
          : 'Locate nearest government health facilities & bed availability',
      icon: Building2,
      page: 'facilities',
      color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    },
    {
      id: 'telemedicine',
      title: language === 'mr' ? 'डॉक्टरांचा सल्ला' : language === 'hi' ? 'डॉक्टर से परामर्श' : 'Consult a Doctor',
      desc:
        language === 'mr'
          ? 'शासकीय तज्ज्ञ डॉक्टरांशी ओपीडी किंवा व्हिडिओ संवाद'
          : language === 'hi'
          ? 'सरकारी विशेषज्ञ डॉक्टरों से वीडियो या ओपीडी परामर्श'
          : 'OPD / Teleconsultation with government doctors',
      icon: Stethoscope,
      page: 'telemedicine',
      color: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300',
    },
    {
      id: 'appointments',
      title: language === 'mr' ? 'अपॉइंटमेंट बुक करा' : language === 'hi' ? 'अपॉइंटमेंट बुक करें' : 'Book Appointment',
      desc:
        language === 'mr'
          ? 'ओपीडी किंवा टेलिमेडिसिनसाठी त्वरित डिजिटल टोकन'
          : language === 'hi'
          ? 'ओपीडी या टेलीमेडिसिन के लिए त्वरित डिजिटल टोकन'
          : 'Book OPD or teleconsultation appointments',
      icon: Calendar,
      page: 'appointments',
      color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    },
    {
      id: 'emergency',
      title: language === 'mr' ? 'आपत्कालीन मदत (१०८)' : language === 'hi' ? 'आपातकालीन सहायता (108)' : 'Emergency Help (108)',
      desc:
        language === 'mr'
          ? 'तातडीच्या मदतीसाठी रुग्णवाहिका व ट्रॉमा केअर'
          : language === 'hi'
          ? 'तत्काल सहायता के लिए एम्बुलेंस व ट्रॉमा केयर'
          : 'Get emergency assistance and ambulance',
      icon: PhoneCall,
      page: 'emergency',
      color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
    },
    {
      id: 'records',
      title: language === 'mr' ? 'आरोग्य नोंदी' : language === 'hi' ? 'स्वास्थ्य रिकॉर्ड' : 'Health Records',
      desc:
        language === 'mr'
          ? 'आपल्या वैद्यकीय तपासण्या, अहवाल व औषधोपचार पत्रिका'
          : language === 'hi'
          ? 'अपनी मेडिकल जांच, लैब रिपोर्ट और पर्चे देखें'
          : 'View your health history, reports & prescriptions',
      icon: FileText,
      page: 'records',
      color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
    },
    {
      id: 'schemes',
      title: language === 'mr' ? 'आरोग्य योजना' : language === 'hi' ? 'स्वास्थ्य योजनाएं' : 'Health Schemes',
      desc:
        language === 'mr'
          ? 'MJPJAY, PM-JAY व शासकीय योजनांचे मोफत लाभ'
          : language === 'hi'
          ? 'MJPJAY, PM-JAY व सरकारी योजनाओं के मुफ्त लाभ'
          : 'Explore government health schemes and benefits',
      icon: ShieldCheck,
      page: 'schemes',
      color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    },
    {
      id: 'medicines',
      title: language === 'mr' ? 'औषध उपलब्धता' : language === 'hi' ? 'दवा उपलब्धता' : 'Medicine Availability',
      desc:
        language === 'mr'
          ? 'जवळच्या केंद्रांमधील मोफत आवश्यक औषध साठा तपासा'
          : language === 'hi'
          ? 'निकटतम केंद्रों में मुफ्त आवश्यक दवा भंडार देखें'
          : 'Check availability of medicines in nearby centers',
      icon: Pill,
      page: 'medicines',
      color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    },
    {
      id: 'health-camps',
      title: language === 'mr' ? 'आरोग्य शिबिरे व कार्यक्रम' : language === 'hi' ? 'स्वास्थ्य शिविर व कार्यक्रम' : 'Health Camps & Programs',
      desc:
        language === 'mr'
          ? 'गावागावांतील चालू व आगामी मोफत आरोग्य शिबिरे'
          : language === 'hi'
          ? 'गांवों में जारी व आगामी मुफ्त स्वास्थ्य शिविर'
          : 'Find ongoing health camps and awareness programs',
      icon: Megaphone,
      page: 'health-camps',
      color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
    },
    {
      id: 'ai-assistant',
      title: language === 'mr' ? 'AI आरोग्य सहाय्यक' : language === 'hi' ? 'AI स्वास्थ्य सहायक' : 'AI Health Assistant',
      desc:
        language === 'mr'
          ? 'आपल्या मातृभाषेत आरोग्यविषयक प्रश्नांची उत्तरे मिळवा'
          : language === 'hi'
          ? 'अपनी भाषा में स्वास्थ्य संबंधी प्रश्नों के उत्तर पाएं'
          : 'Ask your health questions in your language',
      icon: Sparkles,
      page: 'ai-assistant',
      color: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300',
    },
  ];

  // 8 Healthcare Service Categories
  const healthcareServices = [
    {
      id: 'primary-care',
      title: language === 'mr' ? 'प्राथमिक आरोग्य सेवा (PHC)' : language === 'hi' ? 'प्राथमिक स्वास्थ्य सेवा (PHC)' : 'Primary Healthcare (PHC)',
      desc:
        language === 'mr'
          ? 'गावोगावी मोफत ओपीडी, ताप-सर्दी उपचार, मूलभूत रक्त तपासणी व २४ तास प्राथमिक मदत.'
          : language === 'hi'
          ? 'गांव-गांव मुफ्त ओपीडी, बुखार-सर्दी उपचार, बुनियादी रक्त जांच व 24 घंटे प्राथमिक मदद।'
          : 'Comprehensive free OPD, basic diagnostics, fever clinics, and preventive care at village level.',
      icon: Building2,
      page: 'facilities',
    },
    {
      id: 'govt-hospitals',
      title: language === 'mr' ? 'शासकीय व ग्रामीण रुग्णालये' : language === 'hi' ? 'सरकारी व ग्रामीण अस्पताल' : 'Government Hospitals & CHC',
      desc:
        language === 'mr'
          ? 'तालुका व जिल्हा स्तरावर आंतररुग्ण खाटा, शस्त्रक्रिया, सोनोग्राफी व आयसीयू सुविधा.'
          : language === 'hi'
          ? 'तहसील व जिला स्तर पर इनडोर बेड, सर्जरी, सोनोग्राफी व आईसीयू सुविधाएं।'
          : 'Secondary inpatient care, major/minor surgeries, trauma units, and ICU facilities.',
      icon: HeartPulse,
      page: 'facilities',
    },
    {
      id: 'specialist-referral',
      title: language === 'mr' ? 'तज्ज्ञ डॉक्टर व रेफरल' : language === 'hi' ? 'विशेषज्ञ डॉक्टर व रेफरल' : 'Specialist Referral Network',
      desc:
        language === 'mr'
          ? 'हृदयरोग, अस्थिरोग, स्त्रीरोग व बालरोगतज्ज्ञांकडे डिजिटल संदर्भासह थेट प्राधान्य.'
          : language === 'hi'
          ? 'हृदयरोग, हड्डी रोग, स्त्री रोग व बालरोग विशेषज्ञों के लिए डिजिटल रेफरल सुविधा।'
          : 'Structured digital referral linking PHCs to GMC and District Specialist departments.',
      icon: Stethoscope,
      page: 'appointments',
    },
    {
      id: 'telemedicine',
      title: language === 'mr' ? 'टेलिमेडिसिन व ई-संजीवनी' : language === 'hi' ? 'टेलीमेडिसिन व ई-संजीवनी' : 'Telemedicine & Video OPD',
      desc:
        language === 'mr'
          ? 'घरी बसून किंवा उपकेंद्रावरून तज्ज्ञ डॉक्टरांशी मोफत व्हिडिओ सल्लामसलत.'
          : language === 'hi'
          ? 'घर बैठे या उपकेंद्र से विशेषज्ञ डॉक्टरों के साथ मुफ्त वीडियो परामर्श।'
          : 'Remote video consultation with government doctors without long travel journeys.',
      icon: Stethoscope,
      page: 'telemedicine',
    },
    {
      id: 'maternal-child',
      title: language === 'mr' ? 'माता व बाल संगोपन (JSSK)' : language === 'hi' ? 'मातृ एवं शिशु देखभाल (JSSK)' : 'Maternal & Child Care',
      desc:
        language === 'mr'
          ? 'मोफत प्रसूती, जननी सुरक्षा योजना, बाल पोषण व मोफत रुग्णवाहिका प्रवास.'
          : language === 'hi'
          ? 'मुफ्त प्रसव, जननी सुरक्षा योजना, बाल पोषण व मुफ्त एम्बुलेंस सुविधा।'
          : '100% cashless deliveries, nutrition grants (PMMVY), and infant health support.',
      icon: Baby,
      page: 'schemes',
    },
    {
      id: 'vaccination',
      title: language === 'mr' ? 'सार्वत्रिक लसीकरण मोहीम' : language === 'hi' ? 'सार्वभौमिक टीकाकरण अभियान' : 'Universal Immunization',
      desc:
        language === 'mr'
          ? 'बालकांसाठी व गरोदर मातांसाठी सर्व शासकीय लसींचे मोफत वेळापत्रक व प्रमाणपत्र.'
          : language === 'hi'
          ? 'बच्चों और गर्भवती माताओं के लिए सभी सरकारी टीकों का मुफ्त समय-सारणी व प्रमाण-पत्र।'
          : 'Complete free schedule for infant and maternal vaccines with digital ABHA tracking.',
      icon: Syringe,
      page: 'records',
    },
    {
      id: 'emergency-sos',
      title: language === 'mr' ? '२४x७ आपत्कालीन व रुग्णवाहिका' : language === 'hi' ? '24x7 आपातकालीन व एम्बुलेंस सेवा' : '24x7 Emergency Services (108)',
      desc:
        language === 'mr'
          ? 'अपघात, सर्पदंश व हृदयविकारासाठी त्वरित १०८ जीपीएस रुग्णवाहिका प्रेषण.'
          : language === 'hi'
          ? 'दुर्घटना, सर्पदंश व हृदय संबंधी आपात स्थिति के लिए तुरंत 108 जीपीएस एम्बुलेंस सेवा।'
          : 'Toll-free GPS-enabled emergency ambulance dispatch with on-board paramedic support.',
      icon: PhoneCall,
      page: 'emergency',
    },
    {
      id: 'health-schemes',
      title: language === 'mr' ? 'शासकीय योजना (MJPJAY / PM-JAY)' : language === 'hi' ? 'सरकारी योजनाएं (MJPJAY / PM-JAY)' : 'Government Health Schemes',
      desc:
        language === 'mr'
          ? 'प्रति कुटुंब प्रति वर्ष ₹५ लाखांपर्यंत मोफत व कॅशलेस उपचार हमी.'
          : language === 'hi'
          ? 'प्रति परिवार प्रति वर्ष ₹5 लाख तक का मुफ्त व कैशलेस उपचार।'
          : 'Up to ₹5,00,000 cashless medical hospitalization coverage for Maharashtra families.',
      icon: ShieldCheck,
      page: 'schemes',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* 0. OFFICIAL WELCOME & ROLE PORTAL HERO */}
      <section
        id="welcome-portal-gateway-hero"
        className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-900 via-[#0F6B4F] to-teal-950 text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-emerald-800/60 text-left"
      >
        <div className="relative z-10 max-w-4xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-emerald-200 text-xs font-bold shadow-inner">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {language === 'mr'
                ? 'महाराष्ट्र शासन • सार्वजनिक आरोग्य विभाग'
                : language === 'hi'
                ? 'महाराष्ट्र सरकार • सार्वजनिक स्वास्थ्य विभाग'
                : 'Govt. of Maharashtra • Public Health Department'}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {language === 'mr' ? (
                <>ग्रामआरोग्य डिजिटल सेवा मंच</>
              ) : language === 'hi' ? (
                <>ग्रामआरोग्य डिजिटल स्वास्थ्य नेटवर्क</>
              ) : (
                <>GramAarogya Public Health Portal</>
              )}
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl leading-relaxed font-medium">
              {language === 'mr'
                ? 'ग्रामीण महाराष्ट्रातील प्रत्येक नागरिकासाठी प्राथमिक आरोग्य केंद्रे (PHC), शासकीय डॉक्टर्स, मोफत औषध साठा आणि १०८ रुग्णवाहिका सुविधा.'
                : language === 'hi'
                ? 'ग्रामीण महाराष्ट्र के प्रत्येक नागरिक के लिए प्राथमिक स्वास्थ्य केंद्र (PHC), सरकारी डॉक्टर, मुफ्त दवाएं और 108 एम्बुलेंस सेवा।'
                : 'Direct access to Primary Health Centres (PHCs), verified medical officers, free medicine stock availability, and 24x7 emergency medical response.'}
            </p>
          </div>

          {/* Authentication Gateway State */}
          {!currentUser ? (
            <div className="pt-2 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  id="hero-get-started-btn"
                  onClick={() => setCurrentPage('login')}
                  className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition-all shadow-lg hover:shadow-amber-400/20 flex items-center gap-2 cursor-pointer group"
                >
                  <span>{language === 'mr' ? 'प्रारंभ करा (Get Started)' : language === 'hi' ? 'शुरू करें (Get Started)' : 'Get Started'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  id="hero-login-btn"
                  onClick={() => setCurrentPage('login')}
                  className="px-6 py-3 rounded-2xl bg-emerald-800/80 hover:bg-emerald-700/90 text-white font-bold text-sm border border-emerald-600/50 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-emerald-300" />
                  <span>{language === 'mr' ? 'अधिकृत पोर्टल लॉगिन' : language === 'hi' ? 'पोर्टल लॉगिन' : 'Official Portal Login'}</span>
                </button>
              </div>

              {/* 3 Quick Role Selection Gateways */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  id="hero-role-patient"
                  onClick={() => setCurrentPage('patient-login')}
                  className="bg-emerald-950/70 hover:bg-emerald-950/90 border border-emerald-700/60 rounded-2xl p-3.5 text-left transition-all hover:border-emerald-400 cursor-pointer group flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-white group-hover:text-emerald-200">
                      {language === 'mr' ? 'रुग्ण / नागरिक' : language === 'hi' ? 'मरीज / नागरिक' : 'Patient / Citizen'}
                    </div>
                    <div className="text-[11px] text-emerald-300/80 truncate">
                      {language === 'mr' ? 'नोंदणी व तपासणी' : 'ABHA & Appointments'}
                    </div>
                  </div>
                </button>

                <button
                  id="hero-role-doctor"
                  onClick={() => setCurrentPage('doctor-login')}
                  className="bg-emerald-950/70 hover:bg-emerald-950/90 border border-emerald-700/60 rounded-2xl p-3.5 text-left transition-all hover:border-blue-400 cursor-pointer group flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-white group-hover:text-blue-200">
                      {language === 'mr' ? 'शासकीय डॉक्टर' : language === 'hi' ? 'सरकारी डॉक्टर' : 'Doctor OPD Portal'}
                    </div>
                    <div className="text-[11px] text-emerald-300/80 truncate">
                      {language === 'mr' ? 'OPD व संदर्भ सेवा' : 'Clinical & Referrals'}
                    </div>
                  </div>
                </button>

                <button
                  id="hero-role-staff"
                  onClick={() => setCurrentPage('staff-login')}
                  className="bg-emerald-950/70 hover:bg-emerald-950/90 border border-emerald-700/60 rounded-2xl p-3.5 text-left transition-all hover:border-teal-400 cursor-pointer group flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-600/30 border border-teal-500/40 text-teal-300 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-white group-hover:text-teal-200">
                      {language === 'mr' ? 'आरोग्य कर्मचारी' : language === 'hi' ? 'स्वास्थ्य कर्मी' : 'Staff / 108 Driver'}
                    </div>
                    <div className="text-[11px] text-emerald-300/80 truncate">
                      {language === 'mr' ? '१०८ चालक / औषधपाल' : 'Dispatch & Dispensary'}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {language === 'mr'
                    ? `लॉगिन केलेले: ${currentUser.name} (${currentUser.role})`
                    : `Logged in as: ${currentUser.name} (${currentUser.role})`}
                </span>
              </div>
              <button
                onClick={() => {
                  if (currentUser.role === 'doctor') setCurrentPage('doctor-dashboard');
                  else if (currentUser.role === 'admin') setCurrentPage('admin-dashboard');
                  else setCurrentPage('patient-dashboard');
                }}
                className="px-5 py-2.5 rounded-xl bg-white text-[#0F6B4F] font-black text-xs hover:bg-emerald-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>{language === 'mr' ? 'माझ्या डॅशबोर्डवर जा' : 'Open My Dashboard'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 1. TOP OVERVIEW METRIC CARDS */}
      <section id="top-overview-cards-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Nearest PHC */}
          <div
            id="stat-card-nearest-phc"
            className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-start justify-between gap-4 text-left group"
          >
            <div className="space-y-1.5 flex-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {language === 'mr' ? 'जवळचे PHC' : language === 'hi' ? 'निकटतम PHC' : 'Nearest PHC'}
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatDistance(1.2)}
              </div>
              <button
                onClick={() => setCurrentPage('facilities')}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 transition-colors pt-1 cursor-pointer"
              >
                <span>{language === 'mr' ? 'तपशील पहा' : language === 'hi' ? 'विवरण देखें' : 'View Details'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Upcoming Appointment */}
          <div
            id="stat-card-upcoming-appointment"
            className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-start justify-between gap-4 text-left group"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate block">
                {language === 'mr' ? 'आगामी अपॉइंटमेंट' : language === 'hi' ? 'आगामी अपॉइंटमेंट' : 'Upcoming Appointment'}
              </span>
              <div className="text-sm font-black text-slate-900 dark:text-white truncate">
                {language === 'mr' ? '१२ मे, सकाळी ११:३०' : language === 'hi' ? '12 मई, सुबह 11:30' : '12 May, 11:30 AM'}
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                {language === 'mr' ? 'डॉ. प्रिया देशमुख' : language === 'hi' ? 'डॉ. प्रिया देशमुख' : 'Dr. Priya Deshmukh'}
              </div>
              <button
                onClick={() => setCurrentPage('appointments')}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-blue-800 transition-colors pt-0.5 cursor-pointer"
              >
                <span>{language === 'mr' ? 'अपॉइंटमेंट पहा' : language === 'hi' ? 'अपॉइंटमेंट देखें' : 'View Appointment'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Health Records */}
          <div
            id="stat-card-health-records"
            className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-start justify-between gap-4 text-left group"
          >
            <div className="space-y-1.5 flex-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {language === 'mr' ? 'आरोग्य नोंदी' : language === 'hi' ? 'स्वास्थ्य रिकॉर्ड' : 'Health Records'}
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatNumber(12)}
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {language === 'mr' ? 'नोंदी उपलब्ध' : language === 'hi' ? 'रिकॉर्ड उपलब्ध' : 'Records Available'}
              </div>
              <button
                onClick={() => setCurrentPage('records')}
                className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 dark:text-purple-400 hover:text-purple-800 transition-colors pt-0.5 cursor-pointer"
              >
                <span>{language === 'mr' ? 'नोंदी पहा' : language === 'hi' ? 'रिकॉर्ड देखें' : 'View Records'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Emergency 108 */}
          <div
            id="stat-card-emergency"
            className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-start justify-between gap-4 text-left group"
          >
            <div className="space-y-1.5 flex-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t('nav.emergency')}
              </span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                {formatNumber(108)}
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {language === 'mr' ? 'कधीही कॉल करा (२४x७)' : language === 'hi' ? 'कभी भी कॉल करें (24x7)' : 'Call Anytime (24x7)'}
              </div>
              <button
                onClick={() => setCurrentPage('emergency')}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 transition-colors pt-0.5 cursor-pointer"
              >
                <span>{language === 'mr' ? 'कॉल करा' : language === 'hi' ? 'कॉल करें' : 'Call Now'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN HERO: ASK GRAMAAROGYA AI ASSISTANT SECTION */}
      <section id="main-hero-assistant-section">
        <AskGramAarogya />
      </section>

      {/* 2.5 OFFICIAL ROLE-BASED LOGIN PORTALS BANNER */}
      <section id="official-portals-gateway-banner" className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-emerald-800/60 relative overflow-hidden text-left">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('auth.officialGovtBadge')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {t('auth.roleSelectionTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              {t('auth.roleSelectionSubtitle')}
            </p>
          </div>

          {/* 3 Quick Role Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0">
            <button
              id="home-banner-patient-login"
              onClick={() => setCurrentPage('patient-login')}
              className="px-4 py-3 rounded-2xl bg-[#0F6B4F] hover:bg-[#0B4D38] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border border-emerald-400/40"
            >
              <span>{t('auth.patientTitle')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              id="home-banner-doctor-login"
              onClick={() => setCurrentPage('doctor-login')}
              className="px-4 py-3 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border border-blue-400/40"
            >
              <span>{t('auth.doctorTitle')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              id="home-banner-staff-login"
              onClick={() => setCurrentPage('staff-login')}
              className="px-4 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border border-teal-400/40"
            >
              <span>{t('auth.staffTitle')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. QUICK ACTIONS GRID */}
      <section id="quick-actions-section" className="space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {language === 'mr' ? 'जलद कृती (Quick Actions)' : language === 'hi' ? 'त्वरित सेवाएं (Quick Actions)' : 'Quick Actions'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'mr'
                ? 'नागरिकांसाठी आवश्यक प्राथमिक आरोग्य सेवा एका क्लिकवर'
                : language === 'hi'
                ? 'नागरिकों के लिए आवश्यक प्राथमिक स्वास्थ्य सेवाएं एक क्लिक पर'
                : 'Direct access to essential healthcare tools and portals'}
            </p>
          </div>

          <button
            onClick={() => setCurrentPage('facilities')}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            <span>{language === 'mr' ? 'सर्व सेवा पहा' : language === 'hi' ? 'सभी सेवाएं देखें' : 'All Services'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3x3 Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                id={`quick-action-card-${action.id}`}
                onClick={() => setCurrentPage(action.page)}
                className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-emerald-500/50 transition-all cursor-pointer flex items-center justify-between gap-4 group text-left"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60 ${action.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                      {action.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {action.desc}
                    </p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-700 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950 transition-all shrink-0">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. HEALTHCARE SERVICES SECTION */}
      <section id="healthcare-services-section" className="space-y-4 text-left">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {language === 'mr' ? 'सार्वजनिक आरोग्य सेवा' : language === 'hi' ? 'सार्वजनिक स्वास्थ्य सेवाएं' : 'Healthcare Services'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'mr'
              ? 'महाराष्ट्र शासनामार्फत पुरविल्या जाणाऱ्या सर्वसमावेशक मोफत व सवलतीच्या आरोग्य सेवा'
              : language === 'hi'
              ? 'महाराष्ट्र शासन द्वारा प्रदान की जाने वाली व्यापक मुफ्त व रियायती स्वास्थ्य सेवाएं'
              : 'Comprehensive public healthcare programs and facilities supported by Government of Maharashtra'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {healthcareServices.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                id={`service-card-${service.id}`}
                onClick={() => setCurrentPage(service.page)}
                className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-emerald-400 transition-all flex flex-col justify-between space-y-4 group cursor-pointer text-left"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[#0F6B4F] dark:text-emerald-300 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-700 transition-colors">
                    {service.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {service.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <span>{language === 'mr' ? 'माहिती पहा' : language === 'hi' ? 'जानकारी देखें' : 'Explore Service'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. NEARBY HEALTHCARE SECTION */}
      <section id="nearby-healthcare-section" className="space-y-4 text-left">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {language === 'mr' ? 'आपल्या जवळच्या आरोग्य संस्था' : language === 'hi' ? 'आपके निकटतम स्वास्थ्य केंद्र' : 'Healthcare Near You'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'mr'
                ? 'प्राथमिक आरोग्य केंद्र (PHC), ग्रामीण रुग्णालय व जिल्हा रुग्णालयांची पडताळलेली माहिती'
                : language === 'hi'
                ? 'प्राथमिक स्वास्थ्य केंद्र (PHC), ग्रामीण अस्पताल व जिला अस्पतालों की सत्यापित जानकारी'
                : 'Verified public health facilities across Maharashtra with live bed availability and doctor status'}
            </p>
          </div>

          {/* Map / List View Toggle & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={facilitySearch}
                onChange={(e) => setFacilitySearch(e.target.value)}
                placeholder={language === 'mr' ? 'केंद्र किंवा तालुका शोधा...' : language === 'hi' ? 'केंद्र या तहसील खोजें...' : 'Search facility or taluka...'}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48 sm:w-60"
              />
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setNearbyViewMode('cards')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  nearbyViewMode === 'cards'
                    ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{language === 'mr' ? 'कार्ड' : language === 'hi' ? 'कार्ड' : 'List'}</span>
              </button>
              <button
                onClick={() => setNearbyViewMode('map')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  nearbyViewMode === 'map'
                    ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>{language === 'mr' ? 'नकाशा' : language === 'hi' ? 'मानचित्र' : 'Map'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Map View */}
        {nearbyViewMode === 'map' ? (
          <div className="space-y-4">
            <HealthcareMap
              facilities={filteredFacilities}
              selectedFacilityId={selectedFacilityId}
              onSelectFacility={(fac) => setSelectedFacilityId(fac.id)}
              height="450px"
            />
            <div className="text-right">
              <button
                onClick={() => setCurrentPage('facilities')}
                className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{language === 'mr' ? 'संपूर्ण भौगोलिक नकाशा उघडा' : language === 'hi' ? 'संपूर्ण भौगोलिक मानचित्र खोलें' : 'Open Full GIS Map Explorer'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Cards View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFacilities.slice(0, 6).map((facility) => (
              <div
                key={facility.id}
                id={`nearby-facility-${facility.id}`}
                className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 text-left"
              >
                <div className="space-y-2.5">
                  {/* Type and distance */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
                      {facility.type}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{formatDistance(facility.distanceKm)}</span>
                    </span>
                  </div>

                  {/* Facility Name & Location */}
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                      {language === 'mr' ? facility.nameMr : facility.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {facility.address}
                    </p>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {facility.is24x7Emergency && (
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                        ⚡ {language === 'mr' ? '२४x७ आपत्कालीन' : language === 'hi' ? '24x7 आपातकालीन' : '24x7 Emergency'}
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      🛏️ {formatNumber(facility.bedsAvailable)} {language === 'mr' ? 'खाटा शिल्लक' : language === 'hi' ? 'बिस्तर उपलब्ध' : 'Beds Vacant'}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      👨‍⚕️ {formatNumber(facility.doctorsCount)} {language === 'mr' ? 'डॉक्टर' : language === 'hi' ? 'डॉक्टर' : 'Doctors'}
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <a
                    href={`tel:${facility.contactNumber}`}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                    title={`Call ${facility.name}`}
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                  </a>

                  <button
                    onClick={() => {
                      setCurrentPage('facilities');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-center transition-colors cursor-pointer truncate"
                  >
                    {language === 'mr' ? 'तपशील' : language === 'hi' ? 'विवरण' : 'Details'}
                  </button>

                  <button
                    onClick={() => setCurrentPage('appointments')}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#0F6B4F] hover:bg-[#0c5740] text-white font-bold text-center transition-colors cursor-pointer shadow-2xs truncate"
                  >
                    {language === 'mr' ? 'टोकन बुक करा' : language === 'hi' ? 'टोकन बुक करें' : 'Book OPD'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. UPCOMING HEALTH CAMPS & PREVENTIVE DRIVES PREVIEW */}
      <section id="health-camps-preview-section" className="space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {language === 'mr' ? 'आरोग्य शिबिरे व जनजागृती मोहीम' : language === 'hi' ? 'स्वास्थ्य शिविर व जागरूकता अभियान' : 'Health Camps & Programs'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'mr'
                ? 'आपल्या परिसरातील आगामी मोफत तपासणी शिबिरे'
                : language === 'hi'
                ? 'आपके क्षेत्र में आगामी मुफ्त स्वास्थ्य जांच शिविर'
                : 'Free specialist health checkup camps in nearby villages'}
            </p>
          </div>

          <button
            onClick={() => setCurrentPage('health-camps')}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            <span>{language === 'mr' ? 'सर्व शिबिरे पहा' : language === 'hi' ? 'सभी शिविर देखें' : 'View All Camps'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthCamps.slice(0, 2).map((camp) => (
            <div
              key={camp.id}
              className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-4 text-left"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {language === 'mr' ? 'मोफत तपासणी शिबिर' : language === 'hi' ? 'मुफ्त जांच शिविर' : 'Free Specialist Camp'}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{camp.date} • {camp.time}</span>
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {language === 'mr' ? camp.titleMr : camp.title}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{camp.venueAddress}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {formatNumber(camp.registeredCount)} / {formatNumber(camp.totalSlots)} {language === 'mr' ? 'नागरिक नोंदणीकृत' : language === 'hi' ? 'नागरिक पंजीकृत' : 'Citizens Registered'}
                </span>

                <button
                  onClick={() => setCurrentPage('health-camps')}
                  className="px-4 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {language === 'mr' ? 'मोफत नावनोंदणी करा' : language === 'hi' ? 'मुफ्त पंजीकरण करें' : 'Register Free'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
