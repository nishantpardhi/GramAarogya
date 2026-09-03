import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../services/apiClient';
import {
  ShieldCheck,
  Building2,
  Pill,
  Truck,
  UserCheck,
  UserX,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  Activity,
  Database,
} from 'lucide-react';
import { Facility } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const {
    language,
    formatNumber,
    doctors,
    facilities,
    verifyDoctorCredentials,
    refreshData,
    showToast,
    auditLogs,
  } = useApp();

  const [selectedDistrict, setSelectedDistrict] = useState('Nagpur');
  const [activeTab, setActiveTab] = useState<'analytics' | 'doctor_verification' | 'facility_management' | 'data_sources'>('analytics');
  const [providerStatuses, setProviderStatuses] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // New facility form
  const [showAddFacilityModal, setShowAddFacilityModal] = useState(false);
  const [facName, setFacName] = useState('');
  const [facNameMr, setFacNameMr] = useState('');
  const [facType, setFacType] = useState('PHC');
  const [facDistrict, setFacDistrict] = useState('Nagpur');
  const [facTaluka, setFacTaluka] = useState('Ramtek');
  const [facBeds, setFacBeds] = useState('10');
  const [facPhone, setFacPhone] = useState('07114-255100');

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    const res = await apiClient.getDataMode();
    if (res.success && res.data) {
      setProviderStatuses(res.data.providers || []);
    }
  };

  const handleProviderSelect = async (providerId: string) => {
    setIsSyncing(true);
    await apiClient.setDataMode(false, providerId);
    await fetchProviders();
    await refreshData();
    setIsSyncing(false);
    showToast(
      language === 'mr'
        ? `सक्रिय डेटा स्त्रोत बदलण्यात आला: ${providerId}`
        : language === 'hi'
        ? `सक्रिय डेटा स्रोत बदला गया: ${providerId}`
        : `Active data provider updated: ${providerId}`
    );
  };

  const handleVerify = async (doctorId: string, action: 'approve' | 'reject') => {
    await verifyDoctorCredentials(doctorId, action);
    await refreshData();
  };

  const handleAddFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facName) {
      showToast(
        language === 'mr'
          ? 'कृपया आरोग्य संस्थेचे नाव प्रविष्ट करा.'
          : language === 'hi'
          ? 'कृपया स्वास्थ्य संस्थान का नाम दर्ज करें।'
          : 'Please enter facility name.'
      );
      return;
    }

    const payload: Partial<Facility> = {
      name: facName,
      nameMr: facNameMr || facName,
      nameHi: facName,
      type: facType as any,
      district: facDistrict,
      taluka: facTaluka,
      villageOrCity: facTaluka,
      address: `${facTaluka}, ${facDistrict}, Maharashtra`,
      distanceKm: 4.0,
      contactNumber: facPhone,
      emergencyNumber: '108',
      openHours: '24x7 Emergency OPD',
      is24x7Emergency: true,
      hasAmbulance: true,
      hasFreeMedicines: true,
      specialistsAvailable: ['General Medicine', 'Maternal Health'],
      services: ['OPD', 'IPD', 'Free Pharmacy', 'Emergency Anti-Venom'],
      doctorsCount: 2,
      bedsTotal: Number(facBeds) || 10,
      bedsAvailable: Math.max(1, (Number(facBeds) || 10) - 3),
      lat: 21.39,
      lng: 79.32,
      rating: 4.8,
    };

    const res = await apiClient.registerFacility(payload);
    if (res.success) {
      showToast(
        language === 'mr'
          ? 'नवीन शासकीय आरोग्य संस्था यशस्वीरित्या नोंदवली गेली!'
          : language === 'hi'
          ? 'नया सरकारी स्वास्थ्य संस्थान सफलतापूर्वक पंजीकृत हुआ!'
          : 'New government health facility registered successfully!'
      );
      setShowAddFacilityModal(false);
      setFacName('');
      setFacNameMr('');
      await refreshData();
    }
  };

  const pendingDoctors = doctors.filter((d) => d.verificationStatus === 'pending_verification');
  const verifiedDoctors = doctors.filter((d) => d.verificationStatus === 'verified');

  const districtData: Record<
    string,
    { phcCount: number; ambulanceFleet: number; mjpjayClaimsEn: string; mjpjayClaimsMr: string; mjpjayClaimsHi: string; stockStatusEn: string; stockStatusMr: string; stockStatusHi: string }
  > = {
    Nagpur: {
      phcCount: 52,
      ambulanceFleet: 48,
      mjpjayClaimsEn: '₹1.24 Crore',
      mjpjayClaimsMr: '₹१.२४ कोटी',
      mjpjayClaimsHi: '₹1.24 करोड़',
      stockStatusEn: '96% Normal',
      stockStatusMr: '९६% सामान्य',
      stockStatusHi: '96% सामान्य',
    },
    Gadchiroli: {
      phcCount: 46,
      ambulanceFleet: 34,
      mjpjayClaimsEn: '₹88 Lakhs',
      mjpjayClaimsMr: '₹८८ लाख',
      mjpjayClaimsHi: '₹88 लाख',
      stockStatusEn: '89% Normal',
      stockStatusMr: '८९% सामान्य',
      stockStatusHi: '89% सामान्य',
    },
    Wardha: {
      phcCount: 38,
      ambulanceFleet: 28,
      mjpjayClaimsEn: '₹62 Lakhs',
      mjpjayClaimsMr: '₹६२ लाख',
      mjpjayClaimsHi: '₹62 लाख',
      stockStatusEn: '98% Normal',
      stockStatusMr: '९८% सामान्य',
      stockStatusHi: '98% सामान्य',
    },
    Nashik: {
      phcCount: 94,
      ambulanceFleet: 72,
      mjpjayClaimsEn: '₹2.18 Crore',
      mjpjayClaimsMr: '₹२.१८ कोटी',
      mjpjayClaimsHi: '₹2.18 करोड़',
      stockStatusEn: '94% Normal',
      stockStatusMr: '९४% सामान्य',
      stockStatusHi: '94% सामान्य',
    },
    Amravati: {
      phcCount: 61,
      ambulanceFleet: 44,
      mjpjayClaimsEn: '₹1.05 Crore',
      mjpjayClaimsMr: '₹१.०५ कोटी',
      mjpjayClaimsHi: '₹1.05 करोड़',
      stockStatusEn: '91% Normal',
      stockStatusMr: '९१% सामान्य',
      stockStatusHi: '91% सामान्य',
    },
  };

  const currentStats = districtData[selectedDistrict] || districtData['Nagpur'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-purple-800 px-3 py-1 rounded-full border border-purple-600">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {language === 'mr'
                ? 'सार्वजनिक आरोग्य प्रशासकीय नियंत्रण कक्ष'
                : language === 'hi'
                ? 'सार्वजनिक स्वास्थ्य प्रशासनिक नियंत्रण कक्ष'
                : 'Maharashtra Public Health Command Center'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {language === 'mr'
              ? 'आरोग्य अधिकारी नियंत्रण व प्रमाणीकरण कक्ष'
              : language === 'hi'
              ? 'जिला स्वास्थ्य अधिकारी (DHO) प्रशासनिक पोर्टल'
              : 'District Health Officer (DHO) Administration'}
          </h1>
          <p className="text-xs text-purple-200">
            {language === 'mr'
              ? 'डॉक्टर प्रमाणपत्र पडताळणी, प्राथमिक आरोग्य केंद्र व्यवस्थापन, व रिअल-टाइम डेटा स्त्रोत नियंत्रण'
              : language === 'hi'
              ? 'चिकित्सक पंजीकरण सत्यापन, स्वास्थ्य केंद्र प्रबंधन एवं लाइव डेटा स्रोत नियंत्रण'
              : 'Doctor MMC credential verification, health facility registry, and real-time data sources.'}
          </p>
        </div>

        {/* District Switcher */}
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-2xl border border-white/20">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="Nagpur">Nagpur (नागपूर)</option>
              <option value="Gadchiroli">Gadchiroli (गडचिरोली)</option>
              <option value="Wardha">Wardha (वर्धा)</option>
              <option value="Nashik">Nashik (नाशिक)</option>
              <option value="Amravati">Amravati (अमरावती)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-purple-900 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>
            {language === 'mr'
              ? 'आरोग्य आकडेवारी व देखरेख'
              : language === 'hi'
              ? 'जिला सांख्यिकी व निगरानी'
              : 'District Telemetry & Analytics'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('doctor_verification')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative cursor-pointer ${
            activeTab === 'doctor_verification'
              ? 'bg-purple-900 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>
            {language === 'mr'
              ? 'डॉक्टर पडताळणी रांग'
              : language === 'hi'
              ? 'डॉक्टर सत्यापन कतार'
              : 'Doctor MMC Verification Queue'}
          </span>
          {pendingDoctors.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {formatNumber(pendingDoctors.length)}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('facility_management')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'facility_management'
              ? 'bg-purple-900 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>
            {language === 'mr'
              ? 'आरोग्य संस्था नोंदणी'
              : language === 'hi'
              ? 'स्वास्थ्य संस्थान प्रबंधन'
              : 'Health Facility Registry'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('data_sources')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'data_sources'
              ? 'bg-purple-900 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>
            {language === 'mr'
              ? 'डेटा स्त्रोत व ऑडिट जर्नल'
              : language === 'hi'
              ? 'डेटा स्रोत व ऑडिट लॉग'
              : 'Data Providers & Audit Log'}
          </span>
        </button>
      </div>

      {/* Tab 1: Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>{language === 'mr' ? 'कार्यरत PHC / CHC' : language === 'hi' ? 'सक्रिय PHC / CHC' : 'Connected PHCs'}</span>
                <Building2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                {formatNumber(currentStats.phcCount)}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold">
                ✓ {language === 'mr' ? '१००% प्रमाणित व सक्रिय' : language === 'hi' ? '100% सत्यापित व सक्रिय' : '100% Verified & Active'}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>
                  {language === 'mr' ? '१०८ रुग्णवाहिका ताफा' : language === 'hi' ? '108 एम्बुलेंस बेड़ा' : '108 Ambulance Fleet'}
                </span>
                <Truck className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                {formatNumber(currentStats.ambulanceFleet)}
              </div>
              <div className="text-[11px] text-slate-500">
                {language === 'mr'
                  ? 'सरासरी प्रतिसाद वेळ: १२ मिनिटे'
                  : language === 'hi'
                  ? 'औसत प्रतिक्रिया समय: 12 मिनट'
                  : 'Avg response time: 12 mins'}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>{language === 'mr' ? 'MJPJAY योजना दावे' : language === 'hi' ? 'MJPJAY योजना दावे' : 'MJPJAY Claims'}</span>
                <ShieldCheck className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-3xl font-black text-purple-700 dark:text-purple-400 font-mono">
                {language === 'mr'
                  ? currentStats.mjpjayClaimsMr
                  : language === 'hi'
                  ? currentStats.mjpjayClaimsHi
                  : currentStats.mjpjayClaimsEn}
              </div>
              <div className="text-[11px] text-purple-600 font-bold">
                {language === 'mr' ? '१००% मोफत कॅशलेस उपचार' : language === 'hi' ? '100% मुफ्त कैशलेस उपचार' : '100% Free Cashless Care'}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>{language === 'mr' ? 'PHC औषध साठा' : language === 'hi' ? 'PHC दवा स्टॉक' : 'Medicine Supply'}</span>
                <Pill className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-black text-amber-600 font-mono">
                {language === 'mr'
                  ? currentStats.stockStatusMr
                  : language === 'hi'
                  ? currentStats.stockStatusHi
                  : currentStats.stockStatusEn}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold">
                ✓ {language === 'mr' ? 'सर्पदंश लस मुबलक' : language === 'hi' ? 'सर्पदंश टीका प्रचुर' : 'ASV Stock Abundant'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Doctor MMC Verification Queue */}
      {activeTab === 'doctor_verification' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {language === 'mr'
                  ? 'महाराष्ट्र मेडिकल कौन्सिल (MMC) नोंदणी पडताळणी'
                  : language === 'hi'
                  ? 'महाराष्ट्र मेडिकल काउंसिल (MMC) पंजीकरण सत्यापन'
                  : 'Doctor MMC Credential Verification Queue'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'mr'
                  ? 'नवीन नोंदणीकृत डॉक्टरांच्या प्रमाणपत्रांची तपासणी करून त्यांना अधिकृत वैद्यकीय डिरेक्टरीमध्ये प्रसिद्ध करा.'
                  : language === 'hi'
                  ? 'नए पंजीकृत डॉक्टरों के प्रमाण पत्रों की जांच कर उन्हें आधिकारिक निर्देशिका में शामिल करें।'
                  : 'Verify registration credentials before onboarding doctors into the public directory.'}
              </p>
            </div>
            <button
              onClick={refreshData}
              className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 text-xs flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? 'ताजे करा' : language === 'hi' ? 'ताज़ा करें' : 'Refresh'}</span>
            </button>
          </div>

          {pendingDoctors.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'mr'
                  ? 'सर्व डॉक्टर प्रमाणपत्रे पडताळलेली आहेत!'
                  : language === 'hi'
                  ? 'सभी डॉक्टर प्रमाण पत्र सत्यापित हैं!'
                  : 'No Pending Doctor Registrations'}
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {language === 'mr'
                  ? 'सध्या सर्व वैद्यकीय अधिकाऱ्यांची खात्री झाली आहे. नवीन डॉक्टरांनी नोंदणी केल्यास ते येथे दिसतील.'
                  : language === 'hi'
                  ? 'वर्तमान में सभी चिकित्सा अधिकारियों का सत्यापन पूर्ण है।'
                  : 'All doctor credentials in this district have been successfully reviewed and verified.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-amber-300 dark:border-amber-700/60 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 font-bold text-[10px] px-2 py-0.5 rounded-full border border-amber-300">
                        {language === 'mr' ? 'पडताळणी प्रलंबित' : language === 'hi' ? 'सत्यापन लंबित' : 'Pending MMC Review'}
                      </span>
                      <span className="font-mono text-xs text-slate-500 font-bold">
                        Reg: {doc.registrationNumber || 'MMC-PENDING'}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {language === 'mr' ? doc.nameMr : doc.name} ({doc.name})
                    </h3>
                    <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap gap-x-4 gap-y-1">
                      <span>🎓 {doc.qualification}</span>
                      <span>🩺 {language === 'mr' ? doc.specializationMr : doc.specialization}</span>
                      <span>🏥 {language === 'mr' ? doc.facilityNameMr : doc.facilityName}</span>
                      <span>📞 {doc.contactNumber || '9822000000'}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Council: {doc.registrationCouncil || 'Maharashtra Medical Council, Mumbai'}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                      onClick={() => handleVerify(doc.id, 'approve')}
                      className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{language === 'mr' ? 'प्रमाणपत्र मंजूर करा' : language === 'hi' ? 'स्वीकृत करें' : 'Approve & Publish'}</span>
                    </button>
                    <button
                      onClick={() => handleVerify(doc.id, 'reject')}
                      className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-rose-200 dark:border-rose-800 cursor-pointer"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>{language === 'mr' ? 'नामंजूर करा' : language === 'hi' ? 'अस्वीकार करें' : 'Reject'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Verified Doctors Directory */}
          <div className="mt-8 space-y-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              {language === 'mr'
                ? `प्रमाणित वैद्यकीय अधिकारी (${formatNumber(verifiedDoctors.length)})`
                : language === 'hi'
                ? `सत्यापित सक्रिय चिकित्सा संवर्ग (${formatNumber(verifiedDoctors.length)})`
                : `Verified Active Medical Cadre (${verifiedDoctors.length})`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verifiedDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {language === 'mr' ? doc.nameMr : doc.name}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 font-bold text-[9px] px-1.5 py-0.2 rounded-full">
                        ✓ {language === 'mr' ? 'प्रमाणित' : language === 'hi' ? 'सत्यापित' : 'Verified'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {language === 'mr' ? doc.specializationMr : doc.specialization} • {language === 'mr' ? doc.facilityNameMr : doc.facilityName}
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">
                      MMC: {doc.registrationNumber || 'MMC-MAHA-GOVT'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Health Facility Registry Management */}
      {activeTab === 'facility_management' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {language === 'mr'
                  ? 'शासकीय आरोग्य संस्था नोंदणी व यादी'
                  : language === 'hi'
                  ? 'सरकारी स्वास्थ्य संस्थान प्रबंधन'
                  : 'Government Health Facility Management'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'mr'
                  ? 'नवीन प्राथमिक आरोग्य केंद्र, उपकेंद्र किंवा ग्रामीण रुग्णालयाची अधिकृत नोंदणी करा.'
                  : language === 'hi'
                  ? 'नए प्राथमिक स्वास्थ्य केंद्र या ग्रामीण अस्पताल का पंजीकरण करें।'
                  : 'Register and manage verified public healthcare institutions.'}
              </p>
            </div>
            <button
              onClick={() => setShowAddFacilityModal(true)}
              className="px-4 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-purple-900/20 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{language === 'mr' ? 'नवीन केंद्र जोडा' : language === 'hi' ? 'नया केंद्र जोड़ें' : 'Add New Facility'}</span>
            </button>
          </div>

          {/* Facilities Table */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-5 py-3">{language === 'mr' ? 'केंद्राचे नाव' : language === 'hi' ? 'केंद्र का नाम' : 'Facility Name'}</th>
                    <th className="px-5 py-3">{language === 'mr' ? 'प्रकार' : language === 'hi' ? 'प्रकार' : 'Type'}</th>
                    <th className="px-5 py-3">{language === 'mr' ? 'तालुका / जिल्हा' : language === 'hi' ? 'तहसील / जिला' : 'Taluka / District'}</th>
                    <th className="px-5 py-3">{language === 'mr' ? 'खाटा / आपत्कालीन' : language === 'hi' ? 'बिस्तर / आपातकाल' : 'Beds / Emergency'}</th>
                    <th className="px-5 py-3">{language === 'mr' ? 'स्थिती' : language === 'hi' ? 'स्थिति' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {facilities.map((fac) => (
                    <tr key={fac.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750">
                      <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">
                        {language === 'mr' ? fac.nameMr : fac.name}
                        <div className="text-[10px] text-slate-400 font-normal">{fac.name}</div>
                      </td>
                      <td className="px-5 py-3 font-mono font-semibold text-purple-700 dark:text-purple-400">
                        {fac.type}
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                        {fac.taluka}, {fac.district}
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-bold">
                          {formatNumber(fac.bedsAvailable)}/{formatNumber(fac.bedsTotal)} {language === 'mr' ? 'खाटा' : language === 'hi' ? 'बिस्तर' : 'Beds'}
                        </span>
                        <div className="text-[10px] text-emerald-600 font-bold">24x7 Open</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="bg-emerald-100 text-emerald-800 font-bold text-[9px] px-2 py-0.5 rounded-full">
                          ✓ {language === 'mr' ? 'प्रमाणित' : language === 'hi' ? 'सत्यापित' : 'Verified'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Data Sources & Audit Log */}
      {activeTab === 'data_sources' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              {language === 'mr'
                ? 'डेटा स्त्रोत गेटवे व्यवस्थापन'
                : language === 'hi'
                ? 'लाइव डेटा स्रोत गेटवे प्रबंधन'
                : 'Live Data Provider Configuration'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'mr'
                ? 'सिस्टम सध्या खालील डेटा स्त्रोतांशी जोडलेली आहे. आपण त्वरित स्त्रोत बदलू शकता.'
                : language === 'hi'
                ? 'सिस्टम वर्तमान में निम्न डेटा स्रोतों से जुड़ी है। आप कभी भी बदल सकते हैं।'
                : 'Select the active backend data provider for healthcare facility discovery.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {providerStatuses.map((prov) => (
                <div
                  key={prov.id}
                  onClick={() => handleProviderSelect(prov.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    prov.isActive
                      ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 shadow-md ring-2 ring-purple-600/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{prov.name}</div>
                    {prov.isActive ? (
                      <span className="bg-purple-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 font-bold text-[9px] px-2 py-0.5 rounded-full">
                        Available
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">{prov.type}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-2">
                    ✓ Connection: Healthy (200 OK)
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              {language === 'mr'
                ? 'डेटा स्त्रोत ऑडिट जर्नल (Audit Journal)'
                : language === 'hi'
                ? 'डेटा स्रोत ऑडिट जर्नल (Audit Journal)'
                : 'API Gateway & Data Source Audit Journal'}
            </h3>

            <div className="space-y-2 font-mono text-[11px]">
              {auditLogs.length === 0 ? (
                <div className="text-slate-400 text-xs py-4 text-center">
                  {language === 'mr' ? 'कोणतेही ऑडिट रेकॉर्ड उपलब्ध नाहीत.' : 'No audit logs recorded yet.'}
                </div>
              ) : (
                auditLogs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-purple-700 dark:text-purple-400">[{log.action}]</span>
                        <span className="text-slate-600 dark:text-slate-300">{log.endpoint}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">{log.details}</div>
                    </div>
                    <div className="text-[10px] text-slate-400 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString('en-IN')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Facility Modal */}
      {showAddFacilityModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-3xl p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {language === 'mr'
                ? 'नवीन शासकीय आरोग्य संस्था नोंदणी'
                : language === 'hi'
                ? 'नवीन सरकारी स्वास्थ्य केंद्र पंजीकरण'
                : 'Register Government Health Facility'}
            </h3>

            <form onSubmit={handleAddFacility} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Facility Official Name (English)</label>
                <input
                  type="text"
                  required
                  placeholder="Primary Health Centre (PHC) Mansar"
                  value={facName}
                  onChange={(e) => setFacName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">
                  {language === 'mr' ? 'नाव (मराठी)' : language === 'hi' ? 'नाम (हिंदी)' : 'Name (Local)'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'mr' ? 'प्राथमिक आरोग्य केंद्र मानसर' : 'प्राथमिक स्वास्थ्य केंद्र मानसर'}
                  value={facNameMr}
                  onChange={(e) => setFacNameMr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Facility Type</label>
                  <select
                    value={facType}
                    onChange={(e) => setFacType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="PHC">Primary Health Centre (PHC)</option>
                    <option value="CHC">Community Health Centre (CHC)</option>
                    <option value="Sub-Centre">Health Sub-Centre</option>
                    <option value="Sub-District Hospital">Sub-District Hospital</option>
                    <option value="District Hospital">District Hospital</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">District</label>
                  <select
                    value={facDistrict}
                    onChange={(e) => setFacDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Nagpur">Nagpur</option>
                    <option value="Wardha">Wardha</option>
                    <option value="Gadchiroli">Gadchiroli</option>
                    <option value="Nashik">Nashik</option>
                    <option value="Amravati">Amravati</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Taluka</label>
                  <input
                    type="text"
                    value={facTaluka}
                    onChange={(e) => setFacTaluka(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Beds Total</label>
                  <input
                    type="number"
                    value={facBeds}
                    onChange={(e) => setFacBeds(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddFacilityModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  {language === 'mr' ? 'रद्द करा' : language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold shadow-md cursor-pointer"
                >
                  {language === 'mr' ? 'केंद्र नोंदवा' : language === 'hi' ? 'केंद्र पंजीकृत करें' : 'Register Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
