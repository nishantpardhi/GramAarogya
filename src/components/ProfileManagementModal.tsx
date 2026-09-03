import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { SupabaseService } from '../services/supabaseService';
import { apiClient } from '../services/apiClient';
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
  const { t, currentUser, language, showToast, setCurrentUser } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [nameMr, setNameMr] = useState(currentUser?.nameMr || '');
  const [mobile, setMobile] = useState(currentUser?.mobile || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || currentUser?.profilePhoto || '');

  // Patient Fields
  const [age, setAge] = useState<number | string>(currentUser?.age !== undefined && currentUser?.age !== null ? currentUser.age : '');
  const [gender, setGender] = useState(currentUser?.gender || 'Female');
  const [bloodGroup, setBloodGroup] = useState(currentUser?.bloodGroup || 'B+');
  const [place, setPlace] = useState(currentUser?.place || currentUser?.village || 'Ramtek');
  const [village, setVillage] = useState(currentUser?.village || currentUser?.place || 'Ramtek');
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
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        setAvatar(base64Data);
        try {
          const apiRes = await apiClient.uploadProfilePhoto(base64Data);
          const uploadedUrl = apiRes.data?.photoUrl || (apiRes as any).photoUrl || (apiRes as any).profilePhoto;
          if (apiRes.success && uploadedUrl) {
            setAvatar(uploadedUrl);
          }
        } catch (apiErr) {
          console.warn('API photo upload notice:', apiErr);
        }
      };
      reader.readAsDataURL(file);

      const res = await SupabaseService.uploadUserPhoto(currentUser.id, file);
      if (res.success && res.url) {
        setAvatar(res.url);
      }
      showToast(
        t('auto.text_1084')
      );
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

    const resolvedPlace = (place || village || 'Ramtek').trim();
    const updatedProfile: UserProfile = {
      ...currentUser,
      name: name.trim(),
      nameMr: (nameMr || name).trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      avatar: avatar || '',
      profilePhoto: avatar || '',
      place: resolvedPlace,
      village: resolvedPlace,
      // Patient
      ...(role === 'patient' && {
        age: age ? Number(age) : undefined,
        gender: gender as any,
        bloodGroup,
        place: resolvedPlace,
        village: resolvedPlace,
        taluka: taluka.trim(),
        district: district.trim(),
        pinCode: pinCode.trim(),
        address: address.trim(),
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactMobile: emergencyContactMobile.trim(),
        emergencyContact: emergencyContactMobile.trim() || emergencyContactName.trim(),
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

    // 1. Persist directly to backend database
    try {
      await apiClient.updateProfile({
        name: updatedProfile.name,
        nameMr: updatedProfile.nameMr,
        mobile: updatedProfile.mobile,
        avatar: updatedProfile.avatar,
        profilePhoto: updatedProfile.profilePhoto,
        age: updatedProfile.age,
        gender: updatedProfile.gender,
        place: resolvedPlace,
        village: resolvedPlace,
        address: updatedProfile.address,
        taluka: updatedProfile.taluka,
        district: updatedProfile.district,
        pinCode: updatedProfile.pinCode,
        emergencyContact: updatedProfile.emergencyContact,
        emergencyContactMobile: updatedProfile.emergencyContactMobile,
        emergencyContactName: updatedProfile.emergencyContactName,
      });
    } catch (apiErr) {
      console.warn('API updateProfile notice:', apiErr);
    }

    // 2. Persist to Supabase store
    const res = await SupabaseService.updateProfile(updatedProfile);
    setLoading(false);

    // 3. Update AppContext and LocalStorage immediately
    const finalProfile = res.success && res.data ? res.data : updatedProfile;
    setCurrentUser(finalProfile);
    localStorage.setItem('gramarogya_user', JSON.stringify(finalProfile));
    localStorage.setItem('gramarogya_user_profile', JSON.stringify(finalProfile));

    if (res.success) {
      setSuccessMessage(
        t('auto.text_1085')
      );
      showToast(
        t('auto.text_1086')
      );
      setTimeout(() => {
        onClose();
      }, 1000);
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
                {t('auto.text_1087')}
              </h2>
              <p className="text-xs text-emerald-200">
                {t('auto.text_1088')}
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
                {t('auto.text_1089')}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('auto.text_1090')}
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingPhoto ? 'Uploading...' : (t('auto.text_1091'))}</span>
                </button>
                {avatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 hover:bg-rose-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('auto.text_1092')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 2. Common Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                {t('auto.text_1093')} *
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
                {t('auto.text_1094')}
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
                {t('appointments.mobileNumber')} *
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
                {t('auto.text_1095')}
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
                <span>{t('auto.text_1096')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {t('auto.text_1097')}
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
                    {t('auto.text_1098')}
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
                    {t('auto.text_1099')}
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
                    {t('auto.text_1100')}
                  </label>
                  <input
                    type="text"
                    value={place}
                    onChange={(e) => {
                      setPlace(e.target.value);
                      setVillage(e.target.value);
                    }}
                    placeholder="उदा. रामटेक / Ramtek"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {t('auto.text_1101')}
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
                    {t('auto.text_1102')}
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
                    {t('auto.text_1103')}
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
                    {t('auto.text_1104')}
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
                <span>{t('auto.text_1105')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {t('auto.text_1106')}
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
                    {t('auto.text_1107')}
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
                    {t('auto.text_1108')}
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
                    {t('auto.text_1109')}
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
              {t('buttons.cancel')}
            </button>

            <button
              type="submit"
              disabled={loading || uploadingPhoto}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>
                {loading
                  ? (t('auto.text_1111'))
                  : (t('auto.text_1110'))}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
