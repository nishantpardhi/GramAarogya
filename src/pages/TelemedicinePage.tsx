import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../services/apiClient';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Send,
  Wifi,
  ShieldCheck,
  User,
  Pill,
  CheckCircle2,
  Plus,
  Trash2,
  ArrowLeft,
  FileText,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const TelemedicinePage: React.FC = () => {
  const {
    currentUser,
    pageParams,
    appointments,
    doctors,
    language,
    showToast,
    refreshData,
    setCurrentPage,
    createPrescription,
    updateAppointmentStatus,
  } = useApp();

  const [inCall, setInCall] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [callDurationSec, setCallDurationSec] = useState(0);

  // Active appointment context
  const targetApptId = pageParams?.appointmentId;
  const activeAppt = appointments.find((a) => a.id === targetApptId) || appointments[0];

  // Assigned Doctor
  const activeDoctor =
    doctors.find((d) => d.id === activeAppt?.doctorId) ||
    doctors[0] || {
      name: 'Dr. Rameshwar Deshmukh',
      nameMr: 'डॉ. रामेश्वर देशमुख',
      specialization: 'Medical Officer, MBBS',
      facilityName: 'PHC Ramtek, Nagpur',
      registrationNumber: 'MMC-2018-09-4412',
    };

  const isDoctorRole = currentUser?.role === 'doctor';

  // In-Call Prescription Drawer State (For Doctors)
  const [showPrescriptionPanel, setShowPrescriptionPanel] = useState(false);
  const [diagnosis, setDiagnosis] = useState(activeAppt?.symptomsDescription || 'Acute Upper Respiratory Tract Symptoms');
  const [diagnosisMr, setDiagnosisMr] = useState('श्वसनमार्गाचा संसर्ग व ताप');
  const [medicines, setMedicines] = useState<
    { name: string; dosage: string; duration: string; timing: string; isFreeGovtSupply: boolean }[]
  >([
    {
      name: 'Paracetamol 500mg (शासकीय मोफत साठा)',
      dosage: '1 tablet thrice daily',
      duration: '3 days',
      timing: 'After meals',
      isFreeGovtSupply: true,
    },
    {
      name: 'Cetirizine 10mg (Free PHC Supply)',
      dosage: '1 tablet at bedtime',
      duration: '3 days',
      timing: 'Night',
      isFreeGovtSupply: true,
    },
  ]);

  // Chat system
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([
    {
      sender: isDoctorRole
        ? activeAppt?.patientName || 'रुग्ण'
        : language === 'mr'
        ? activeDoctor.nameMr
        : activeDoctor.name,
      text: isDoctorRole
        ? language === 'mr'
          ? 'नमस्कार डॉक्टर, मला २ दिवसांपासून ताप आणि खोकला आहे.'
          : 'Hello Doctor, I am experiencing fever and mild throat irritation since 2 days.'
        : language === 'mr'
        ? 'नमस्कार! सांगा, आज काय त्रास होत आहे? आपण व्हिडिओ कॉलवर जोडले गेलो आहोत.'
        : 'Hello! How are you feeling today? We are connected securely via video consultation.',
      time: 'Just now',
    },
  ]);
  const [msgInput, setMsgInput] = useState('');

  // Call timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (inCall) {
      timer = setInterval(() => {
        setCallDurationSec((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [inCall]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = msgInput.trim();
    if (!query) return;

    const myName =
      currentUser?.name ||
      (language === 'mr' ? 'तुम्ही' : 'You');

    setChatMessages((prev) => [
      ...prev,
      { sender: myName, text: query, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setMsgInput('');

    try {
      const res = await apiClient.sendChatMessage({
        message: `[Telemedicine Session] ${query}`,
        language,
        userRole: currentUser?.role || 'patient',
      });

      const reply = (res as any)?.reply || (res as any)?.message || (res as any)?.aiResponse || '';
      if (reply) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: isDoctorRole ? activeAppt?.patientName || 'Patient' : (language === 'mr' ? activeDoctor.nameMr : activeDoctor.name),
            text: reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        return;
      }
    } catch {
      // Fallback response
    }
  };

  const addMedicineRow = () => {
    setMedicines((prev) => [
      ...prev,
      {
        name: 'Amoxicillin 500mg (Free PHC Supply)',
        dosage: '1 capsule twice daily',
        duration: '5 days',
        timing: 'After meals',
        isFreeGovtSupply: true,
      },
    ]);
  };

  const removeMedicineRow = (idx: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleIssuePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAppt) return;

    createPrescription({
      appointmentId: activeAppt.id,
      patientId: activeAppt.patientId,
      patientName: activeAppt.patientName,
      patientAge: activeAppt.patientAge,
      patientVillage: activeAppt.patientVillage,
      doctorId: currentUser?.id || activeDoctor.id || 'doc-1',
      doctorName: currentUser?.name || activeDoctor.name,
      doctorSpecialization: activeDoctor.specialization,
      facilityName: activeDoctor.facilityName,
      date: new Date().toISOString().split('T')[0],
      diagnosis: diagnosis || 'Telemedicine clinical assessment',
      diagnosisMr: diagnosisMr || 'टेलिमेडिसिन सल्लामसलत रोगनिदान',
      symptoms: [activeAppt.symptomsDescription || 'General Consultation'],
      medicines: medicines.map((m) => ({
        name: m.name,
        genericName: m.name.split(' ')[0],
        dosage: m.dosage,
        frequency: 'Twice daily',
        durationDays: 5,
        instructions: m.timing,
        instructionsMr: 'जेवणानंतर',
      })),
      recommendedTests: ['Blood Routine', 'Vital Check at local Sub-Centre'],
      advice: 'Drink warm water and rest. Take medicines as prescribed.',
      followUpRequired: false,
      signedDigitally: true,
    });

    await updateAppointmentStatus(activeAppt.id, 'Completed', diagnosis);

    showToast(
      language === 'mr'
        ? 'टेलिमेडिसिन औषधोपचार पत्रिका रुग्णाच्या ABHA खात्यात सेव्ह झाली!'
        : 'Telemedicine prescription issued and synced to patient records!'
    );
    setShowPrescriptionPanel(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      {/* Back button */}
      <button
        onClick={() => setCurrentPage(isDoctorRole ? 'doctor_dashboard' : 'patient_dashboard')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>
          {isDoctorRole
            ? language === 'mr'
              ? '← डॉक्टर डॅशबोर्डवर परत जा'
              : '← Return to Doctor Dashboard'
            : language === 'mr'
            ? '← रुग्ण डॅशबोर्डवर परत जा'
            : '← Return to Patient Dashboard'}
        </span>
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-teal-800 px-3 py-1 rounded-full border border-teal-600">
            <Video className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {language === 'mr' ? 'ई-संजीवनी थेट टेलिमेडिसिन कक्ष' : 'e-Sanjeevani Active Teleconsultation Room'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {isDoctorRole
              ? `${language === 'mr' ? 'रुग्ण तपासणी:' : 'Consulting:'} ${activeAppt?.patientName || 'Patient'} (${activeAppt?.patientAge} yrs, ${activeAppt?.patientVillage})`
              : `${language === 'mr' ? 'वैद्यकीय सल्ला:' : 'Doctor:'} ${language === 'mr' ? activeDoctor.nameMr : activeDoctor.name}`}
          </h1>
          <p className="text-xs sm:text-sm text-teal-200">
            {activeAppt?.symptomsDescription
              ? `लक्षणे / कारण: ${activeAppt.symptomsDescription}`
              : 'Low-bandwidth WebRTC-optimized video consultations for rural health.'}
          </p>
        </div>

        <div className="bg-white/10 p-4 rounded-2xl border border-white/20 flex items-center gap-3">
          <Wifi className="w-6 h-6 text-emerald-400 animate-pulse" />
          <div className="text-xs">
            <div className="font-bold">2G/3G Low-Data Mode</div>
            <div className="text-teal-200 text-[10px]">
              {language === 'mr' ? 'कमी डेटा मोड सुरू' : 'Active WebRTC Stream'}
            </div>
          </div>
        </div>
      </div>


      {/* Main Consultation Room */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Video Area */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-950 rounded-3xl p-4 aspect-video flex flex-col justify-between relative overflow-hidden shadow-2xl border border-slate-800">
            {/* Top Bar inside Video */}
            <div className="flex items-center justify-between z-10">
              <div className="bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs text-white">
                <span className={`w-2.5 h-2.5 rounded-full ${inCall ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`}></span>
                <span className="font-mono font-bold">
                  {inCall ? formatTimer(callDurationSec) : language === 'mr' ? 'कॉल बंद' : 'Call Paused'}
                </span>
                <span className="text-slate-400 text-[10px]">• Token #{activeAppt?.tokenNumber || '1'}</span>
              </div>

              <div className="bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ABDM Encrypted</span>
              </div>
            </div>

            {/* Video Main Body Avatar */}
            <div className="my-auto text-center space-y-3 z-10">
              <div className="w-24 h-24 rounded-3xl bg-teal-800 border-4 border-teal-500/40 mx-auto flex items-center justify-center text-4xl shadow-2xl">
                {isDoctorRole ? '👤' : '👨‍⚕️'}
              </div>
              <div>
                <h3 className="text-xl font-black text-white">
                  {isDoctorRole
                    ? activeAppt?.patientName || 'रुग्ण'
                    : language === 'mr'
                    ? activeDoctor.nameMr
                    : activeDoctor.name}
                </h3>
                <p className="text-xs text-slate-300">
                  {isDoctorRole
                    ? `📍 ${activeAppt?.patientVillage} • Age: ${activeAppt?.patientAge} yrs • ${activeAppt?.patientMobile}`
                    : `${activeDoctor.specialization} • ${activeDoctor.facilityName}`}
                </p>
              </div>
            </div>

            {/* Video Controls Bottom Bar */}
            <div className="flex flex-wrap items-center justify-center gap-3 z-10 pt-2">
              <button
                onClick={() => setMicOn(!micOn)}
                className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
                  micOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
                }`}
                title="Toggle Microphone"
              >
                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setVideoOn(!videoOn)}
                className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
                  videoOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
                }`}
                title="Toggle Camera"
              >
                {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => {
                  setInCall(!inCall);
                  showToast(inCall ? 'Video call paused.' : 'Video call resumed.');
                }}
                className={`px-6 py-3.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  inCall ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {inCall ? (
                  <>
                    <PhoneOff className="w-4 h-4" />
                    <span>{language === 'mr' ? 'कॉल समाप्त करा' : 'End Call'}</span>
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4" />
                    <span>{language === 'mr' ? 'कॉल पुन्हा सुरू करा' : 'Resume Call'}</span>
                  </>
                )}
              </button>

              {/* In-Call e-Prescription trigger for Doctor */}
              {isDoctorRole && (
                <button
                  onClick={() => setShowPrescriptionPanel(!showPrescriptionPanel)}
                  className="px-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  <Pill className="w-4 h-4" />
                  <span>
                    {showPrescriptionPanel
                      ? language === 'mr'
                        ? 'पर्ची लपवा'
                        : 'Hide Prescription'
                      : language === 'mr'
                      ? 'औषधोपचार पत्रिका लिहा'
                      : 'Write e-Prescription'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* In-Call Doctor Prescription Pad Drawer */}
          {isDoctorRole && showPrescriptionPanel && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-emerald-200 dark:border-emerald-800 shadow-xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {language === 'mr'
                      ? 'थेट टेलिमेडिसिन औषधोपचार पत्रिका (Live e-Prescription Pad)'
                      : 'Live e-Prescription Pad'}
                  </h3>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl">
                  Patient: {activeAppt?.patientName}
                </span>
              </div>

              <form onSubmit={handleIssuePrescription} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold block mb-1">Diagnosis (English)</label>
                    <input
                      type="text"
                      required
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Diagnosis (मराठी)</label>
                    <input
                      type="text"
                      value={diagnosisMr}
                      onChange={(e) => setDiagnosisMr(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Medicines (Free Govt Stock):</span>
                    <button
                      type="button"
                      onClick={addMedicineRow}
                      className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === 'mr' ? 'औषध जोडा' : 'Add Medicine'}</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {medicines.map((med, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center gap-2"
                      >
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMedicines((prev) => prev.map((m, i) => (i === idx ? { ...m, name: val } : m)));
                          }}
                          className="flex-1 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs text-slate-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMedicines((prev) => prev.map((m, i) => (i === idx ? { ...m, dosage: val } : m)));
                          }}
                          className="w-32 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMedicines((prev) => prev.map((m, i) => (i === idx ? { ...m, duration: val } : m)));
                          }}
                          className="w-24 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                        />
                        {medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedicineRow(idx)}
                            className="text-rose-500 p-1 hover:bg-rose-50 rounded cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {language === 'mr'
                      ? 'स्वाक्षरी करून डिजिटल औषधोपचार पत्रिका जारी करा'
                      : 'Sign & Issue Digital Prescription'}
                  </span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Live Chat & Notes Sidebar */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between h-[520px]">
          <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-600" />
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase">
                  {language === 'mr' ? 'थेट संवाद (Live Chat)' : 'Consultation Chat'}
                </h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Live Online
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl max-w-[88%] ${
                    msg.sender === currentUser?.name || msg.sender.includes('You') || msg.sender.includes('तुम्ही')
                      ? 'ml-auto bg-teal-600 text-white rounded-br-none'
                      : 'mr-auto bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
                  }`}
                >
                  <div className="text-[10px] font-bold opacity-80 mb-0.5 flex items-center justify-between gap-2">
                    <span>{msg.sender}</span>
                    <span className="text-[9px] opacity-60 font-normal">{msg.time}</span>
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendChat} className="pt-3 border-t border-slate-100 dark:border-slate-700 flex gap-2">
            <input
              type="text"
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              placeholder={
                language === 'mr'
                  ? 'येथे संदेश किंवा लक्षणे लिहा...'
                  : 'Type message or symptoms...'
              }
              className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white font-medium"
            />
            <button
              type="submit"
              className="p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
