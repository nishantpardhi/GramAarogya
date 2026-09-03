import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { SupabaseService } from '../services/supabaseService';
import {
  X,
  Camera,
  Upload,
  User,
  Phone,
  MapPin,
  HeartPulse,
  Award,
  Building,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileManagementModal: React.FC<ProfileManagementModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, language, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [nameMr, setNameMr] = useState(currentUser?.nameMr || '');
  const [mobile, setMobile] = useState(currentUser?.mobile || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');

  // Patient Fields
  const [age, setAge] = useState<number | string>(currentUser?.age || '');
  const [gender, setGender] = useState(currentUser?.gender || 'Male');
  const [bloodGroup, setBloodGroup] = useState(currentUser?.bloodGroup || 'B+');
  const [village, setVillage] = useState(currentUser?.village || 'Ramtek');
  const [taluka, setTaluka] = useState(currentUser?.taluka || 'Ramtek');
  const [district, setDistrict] = useState(currentUser?.district || 'Nagpur');
  const [pinCode, setPinCode] = useState(currentUser?.pinCode || '441106');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [emergencyContactName, setEmergencyContactName] = useState(currentUser?.emergencyContactName || '');
  const [emergencyContactMobile, setEmergencyContactMobile] = useState(currentUser?.emergencyContactMobile || '');
  const [allergiesText, setAllergiesText] = useState((currentUser?.allergies || []).join(', '));
  const [chronicText, setChronicText] = useState((currentUser?.chronicConditions || []).join(', '));

  // Doctor Fields
  const [qualification, setQualification] = useState(currentUser?.qualification || 'MBBS, MD');
  const [specialization, setSpecialization] = useState(currentUser?.specialization || 'General Medicine');
  const [department, setDepartment] = useState(currentUser?.department || 'General Medicine OPD');
  const [experienceYears, setExperienceYears] = useState<number | string>(currentUser?.experienceYears || 5);
  const [registrationNumber, setRegistrationNumber] = useState(currentUser?.registrationNumber || 'MMC-2018-09142');
  const [registrationCouncil, setRegistrationCouncil] = useState(
    currentUser?.registrationCouncil || 'Maharashtra Medical Council (MMC), Mumbai'
  );
  const [availableHours, setAvailableHours] = useState(currentUser?.availableHours || '09:00 AM - 04:00 PM');
  const [isOnlineForTelemedicine, setIsOnlineForTelemedicine] = useState(currentUser?.isOnlineForTelemedicine ?? true);

  if (!isOpen || !currentUser) return null;

  const role = currentUser.role;

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const res = await SupabaseService.uploadUserPhoto(currentUser.id, file);
      if (res.success && res.url) {
        setAvatar(res.url);
        showToast(
          language === 'mr'
            ? 'प्रोफाईल फोटो यशस्वीरित्या सेव्ह झाला!'
            : language === 'hi'
            ? 'प्रोफ़ाइल फोटो सफलतापूर्वक सेव हो गया!'
            : 'Profile photo updated successfully!'
        );
      } else {
        showToast(res.error || 'Failed to upload photo');
      }
    } catch (err: any) {
      showToast(err?.message || 'Photo upload error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setAvatar('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);

    const updatedProfile: UserProfile = {
      ...currentUser,
      name,
      nameMr: nameMr || name,
      mobile,
      email,
      avatar,
      // Patient
      ...(role === 'patient' && {
        age: age ? Number(age) : undefined,
        gender: gender as any,
        bloodGroup,
        village,
        taluka,
        district,
        pinCode,
        address,
        emergencyContactName,
        emergencyContactMobile,
        allergies: allergiesText ? allergiesText.split(',').map((s) => s.trim()) : [],
        chronicConditions: chronicText ? chronicText.split(',').map((s) => s.trim()) : [],
      }),
      // Doctor
      ...(role === 'doctor' && {
        qualification,
        specialization,
        specializationMr: specialization === 'General Medicine' ? 'सामान्य चिकित्सा' : specialization,
        department,
        experienceYears: Number(experienceYears) || 1,
        registrationNumber,
        registrationCouncil,
        availableHours,
        isOnlineForTelemedicine,
      }),
    };

    const res = await SupabaseService.updateProfile(updatedProfile);
    setLoading(false);

    if (res.success) {
      setSuccessMessage(
        language === 'mr'
          ? 'तुमची प्रोफाईल माहिती Supabase मध्ये यशस्वीरित्या अद्यतनित झाली आहे.'
          : language === 'hi'
          ? 'आपकी प्रोफ़ाइल जानकारी Supabase में सफलतापूर्वक अपडेट हो गई है।'
          : 'Your profile has been saved to Supabase successfully.'
      );
      showToast(
        language === 'mr'
          ? 'प्रोफाईल माहिती सेव्ह झाली!'
          : language === 'hi'
          ? 'प्रोफ़ाइल सुरक्षित हो गई!'
          : 'Profile saved successfully!'
      );
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  // Generate initials for avatar fallback (no fake human photos)
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'GA';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-8 text-left transition-all">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
              <User className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black">
                {language === 'mr'
                  ? 'वापरकर्ता प्रोफाईल व्यवस्थापन (Supabase)'
                  : language === 'hi'
                  ? 'उपयोगकर्ता प्रोफ़ाइल प्रबंधन (Supabase)'
                  : 'User Profile Management (Supabase)'}
              </h2>
              <p className="text-xs text-emerald-200">
                {language === 'mr'
                  ? 'अधिकृत माहिती बदला व Supabase स्टोरेजवर फोटो अपलोड करा'
                  : language === 'hi'
                  ? 'अधिकृत जानकारी बदलें और Supabase स्टोरेज पर फोटो अपलोड करें'
                  : 'Update authorized profile fields and manage storage photos'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {successMessage && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. Photo Upload Section */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-2xl flex items-center justify-center border-2 border-emerald-400 shadow-md">
                  {initials}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute -bottom-2 -right-2 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg border-2 border-white dark:border-slate-900 cursor-pointer transition-transform group-hover:scale-110"
                title="Upload Photo"
              >
                {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />

            <div className="space-y-2 text-center sm:text-left">
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                {language === 'mr' ? 'प्रोफाईल छायाचित्र (Supabase Storage)' : language === 'hi' ? 'प्रोफ़ाइल फ़ोटो (Supabase Storage)' : 'Profile Photo (Supabase Storage)'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'mr'
                  ? 'फोटो थेट Supabase Storage बकेटमध्ये सुरक्षित अपलोड केला जाईल.'
                  : language === 'hi'
                  ? 'फोटो सीधे Supabase Storage बकेट में सुरक्षित अपलोड होगा।'
                  : 'Photo is securely stored in Supabase Storage. Default initial avatar shown when empty.'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingPhoto ? 'Uploading...' : (language === 'mr' ? 'फोटो अपलोड करा' : language === 'hi' ? 'फोटो अपलोड करें' : 'Upload Photo')}</span>
                </button>
                {avatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 hover:bg-rose-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === 'mr' ? 'काढून टाका' : language === 'hi' ? 'हटाएं' : 'Remove'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 2. Common Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                {language === 'mr' ? 'पूर्ण नाव (English)' : language === 'hi' ? 'पूरा नाम (English)' : 'Full Name (English)'} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                {language === 'mr' ? 'नाव (मराठी / स्थानिक भाषा)' : language === 'hi' ? 'नाम (हिंदी / स्थानीय भाषा)' : 'Name (Regional / Marathi)'}
              </label>
              <input
                type="text"
                value={nameMr}
                onChange={(e) => setNameMr(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                {language === 'mr' ? 'मोबाईल क्रमांक' : language === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'} *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                {language === 'mr' ? 'ईमेल पत्ता' : language === 'hi' ? 'ईमेल पता' : 'Email Address'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          {/* 3. PATIENT ROLE SPECIFIC FIELDS */}
          {role === 'patient' && (
            <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                <HeartPulse className="w-4 h-4" />
                <span>{language === 'mr' ? 'रुग्ण वैयक्तिक व आरोग्य तपशील' : language === 'hi' ? 'मरीज व्यक्तिगत व स्वास्थ्य विवरण' : 'Patient Health & Residential Details'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'mr' ? 'वय (Age)' : language === 'hi' ? 'उम्र (Age)' : 'Age'}
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'mr' ? 'लिंग (Gender)' : language === 'hi' ? 'लिंग (Gender)' : 'Gender'}
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  >
                    <option value="Male">Male / पुरुष</option>
                    <option value="Female">Female / स्त्री</option>
                    <option value="Other">Other / इतर</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'mr' ? 'रक्तगट (Blood Group)' : language === 'hi' ? 'रक्त समूह (Blood Group)' : 'Blood Group'}
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'mr' ? 'गाव / शहर' : language === 'hi' ? 'गाँव / शहर' : 'Village / City'}
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'mr' ? 'तालुका' : language === 'hi' ? 'तालुका' : 'Taluka'}
                  </label>
                  <input
                    type="text"
                    value={taluka}
                    onChange={(e) => setTaluka(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'mr' ? 'जिल्हा' : language === 'hi' ? 'जिला' : 'District'}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'mr' ? 'आपत्कालीन संपर्क व्यक्तीचे नाव' : language === 'hi' ? 'आपातकालीन संपर्क व्यक्ति का नाम' : 'Emergency Contact Person'}
                  </label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'mr' ? 'आपत्कालीन संपर्क मोबाईल' : language === 'hi' ? 'आपातकालीन संपर्क मोबाइल' : 'Emergency Contact Mobile'}
                  </label>
                  <input
                    type="text"
                    value={emergencyContactMobile}
                    onChange={(e) => setEmergencyContactMobile(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. DOCTOR ROLE SPECIFIC FIELDS */}
          {role === 'doctor' && (
            <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs">
                <Award className="w-4 h-4" />
                <span>{language === 'mr' ? 'वैद्यकीय पात्रता व पद तपशील' : language === 'hi' ? 'चिकित्सीय योग्यता व पद विवरण' : 'Medical Credentials & Registration'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'mr' ? 'वैद्यकीय पात्रता (Qualification)' : language === 'hi' ? 'योग्यता (Qualification)' : 'Qualification'}
                  </label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'mr' ? 'विशेषज्ञता (Specialization)' : language === 'hi' ? 'विशेषज्ञता (Specialization)' : 'Specialization'}
                  </label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'mr' ? 'MMC नोंदणी क्रमांक' : language === 'hi' ? 'MMC पंजीकरण संख्या' : 'MMC Registration Number'}
                  </label>
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'mr' ? 'कामाचे तास (Working Hours)' : language === 'hi' ? 'कार्य समय (Working Hours)' : 'Working Hours'}
                  </label>
                  <input
                    type="text"
                    value={availableHours}
                    onChange={(e) => setAvailableHours(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              {language === 'mr' ? 'रद्द करा' : language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={loading || uploadingPhoto}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>
                {loading
                  ? (language === 'mr' ? 'जतन करत आहे...' : 'Saving to Supabase...')
                  : (language === 'mr' ? 'बदल जतन करा (Save to Supabase)' : language === 'hi' ? 'बदलाव सेव करें' : 'Save Changes to Supabase')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
