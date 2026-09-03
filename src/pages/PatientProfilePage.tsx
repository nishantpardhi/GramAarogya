import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../services/apiClient';
import {
  User,
  Camera,
  Edit3,
  Check,
  X,
  Phone,
  Calendar,
  MapPin,
  Heart,
  Shield,
  Upload,
  AlertCircle,
  ArrowLeft,
  LogOut,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

export const PatientProfilePage: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    setCurrentPage,
    pageParams,
    language,
    logout,
    showToast,
  } = useApp();

  const isFirstTimeSetup = pageParams?.isFirstTimeSetup || false;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile data states
  const [isEditing, setIsEditing] = useState(isFirstTimeSetup);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    age: '' as string | number,
    dateOfBirth: '',
    gender: 'Female',
    mobileNumber: '',
    village: '',
    address: '',
    emergencyContact: '',
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<string | null>(null);

  // Sync state from currentUser or backend on mount
  useEffect(() => {
    loadProfileFromBackend();
  }, []);

  const loadProfileFromBackend = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.getProfile();
      if (res.success && res.profile) {
        const p = res.profile;
        setFormData({
          name: p.name || '',
          age: p.age || '',
          dateOfBirth: p.dateOfBirth || p.dob || '',
          gender: p.gender || 'Female',
          mobileNumber: p.mobileNumber || p.mobile || '',
          village: p.village || 'Ramtek',
          address: p.address || '',
          emergencyContact: p.emergencyContact || p.emergencyContactMobile || '',
        });

        const activePhoto = p.profilePhoto || p.avatar || null;
        setPhotoPreview(activePhoto);

        // Update context if changed
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            ...p,
            profilePhoto: activePhoto || '',
            avatar: activePhoto || '',
          });
        }
      } else if (currentUser) {
        // Fallback to existing user in memory
        setFormData({
          name: currentUser.name || '',
          age: currentUser.age || '',
          dateOfBirth: currentUser.dateOfBirth || currentUser.dob || '',
          gender: currentUser.gender || 'Female',
          mobileNumber: currentUser.mobileNumber || currentUser.mobile || '',
          village: currentUser.village || 'Ramtek',
          address: currentUser.address || '',
          emergencyContact: currentUser.emergencyContact || currentUser.emergencyContactMobile || '',
        });
        setPhotoPreview(currentUser.profilePhoto || currentUser.avatar || null);
      }
    } catch (err: any) {
      console.warn('Could not fetch remote profile:', err);
      if (currentUser) {
        setFormData({
          name: currentUser.name || '',
          age: currentUser.age || '',
          dateOfBirth: currentUser.dateOfBirth || currentUser.dob || '',
          gender: currentUser.gender || 'Female',
          mobileNumber: currentUser.mobileNumber || currentUser.mobile || '',
          village: currentUser.village || 'Ramtek',
          address: currentUser.address || '',
          emergencyContact: currentUser.emergencyContact || currentUser.emergencyContactMobile || '',
        });
        setPhotoPreview(currentUser.profilePhoto || currentUser.avatar || null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Photo selection from device
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(
        language === 'mr'
          ? 'कृपया वैध फोटो फाईल निवडा (JPG, PNG, WebP).'
          : 'Please select a valid image file (JPG, PNG, WebP).'
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(
        language === 'mr'
          ? 'फोटोची साईझ ५MB पेक्षा कमी असावी.'
          : 'Image size should be less than 5MB.'
      );
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      setPhotoPreview(base64Data);
      setSelectedPhotoFile(base64Data);
    };
    reader.readAsDataURL(file);
  };

  // Dedicated Photo Upload
  const handleUploadPhoto = async () => {
    if (!selectedPhotoFile) return;

    setIsUploadingPhoto(true);
    setErrorMessage(null);
    try {
      const uploadRes = await apiClient.uploadProfilePhoto(selectedPhotoFile);
      if (uploadRes.success) {
        const savedUrl = uploadRes.photoUrl || selectedPhotoFile;
        setPhotoPreview(savedUrl);
        setSelectedPhotoFile(null);

        // Update context & local storage
        if (currentUser) {
          const updated = {
            ...currentUser,
            avatar: savedUrl,
            profilePhoto: savedUrl,
          };
          setCurrentUser(updated);
          localStorage.setItem('gramarogya_user', JSON.stringify(updated));
        }

        const msg =
          language === 'mr'
            ? 'प्रोफाईल फोटो यशस्वीरित्या सेव्ह झाला!'
            : 'Profile photo successfully saved to database!';
        setSuccessMessage(msg);
        showToast(msg);
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(uploadRes.error || 'Failed to upload profile photo.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Photo upload error.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Handle form field change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save full profile changes to backend
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload: any = {
        name: formData.name.trim(),
        age: formData.age ? Number(formData.age) : undefined,
        dateOfBirth: formData.dateOfBirth,
        dob: formData.dateOfBirth,
        gender: formData.gender,
        mobile: formData.mobileNumber.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        village: formData.village.trim(),
        address: formData.address.trim(),
        emergencyContact: formData.emergencyContact.trim(),
        emergencyContactMobile: formData.emergencyContact.trim(),
      };

      // Include photo if new photo was chosen
      if (selectedPhotoFile) {
        payload.profilePhoto = selectedPhotoFile;
        payload.avatar = selectedPhotoFile;
      }

      const res = await apiClient.updateProfile(payload);
      if (res.success) {
        const updated = res.profile || payload;
        const finalPhoto = updated.profilePhoto || updated.avatar || photoPreview || '';

        setFormData({
          name: updated.name || formData.name,
          age: updated.age || formData.age,
          dateOfBirth: updated.dateOfBirth || updated.dob || formData.dateOfBirth,
          gender: updated.gender || formData.gender,
          mobileNumber: updated.mobileNumber || updated.mobile || formData.mobileNumber,
          village: updated.village || formData.village,
          address: updated.address || formData.address,
          emergencyContact: updated.emergencyContact || formData.emergencyContact,
        });

        setPhotoPreview(finalPhoto);
        setSelectedPhotoFile(null);
        setIsEditing(false);

        // Update global AppContext state
        if (currentUser) {
          const merged = {
            ...currentUser,
            ...updated,
            profilePhoto: finalPhoto,
            avatar: finalPhoto,
          };
          setCurrentUser(merged);
          localStorage.setItem('gramarogya_user', JSON.stringify(merged));
        }

        const msg =
          language === 'mr'
            ? 'माहिती डेटाबेसमध्ये यशस्वीरित्या जतन केली!'
            : 'Patient profile changes successfully saved to database!';
        setSuccessMessage(msg);
        showToast(msg);
        setTimeout(() => setSuccessMessage(null), 4000);

        if (isFirstTimeSetup) {
          setCurrentPage('patient-dashboard');
        }
      } else {
        setErrorMessage(res.error || 'Failed to update profile.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedPhotoFile(null);
    setErrorMessage(null);
    loadProfileFromBackend();
  };

  return (
    <div id="patient-profile-page" className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation / Header Bar */}
        <div className="flex items-center justify-between gap-4">
          {!isFirstTimeSetup ? (
            <button
              id="btn-back-to-dashboard"
              onClick={() => setCurrentPage('patient-dashboard')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'mr' ? 'डॅशबोर्डवर परत' : 'Back to Dashboard'}</span>
            </button>
          ) : (
            <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
              {language === 'mr' ? 'प्रोफाईल पूर्ण करा' : 'Please Complete Profile Setup'}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              id="btn-refresh-profile"
              onClick={loadProfileFromBackend}
              disabled={isLoading}
              title="Refresh Data"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            <button
              id="btn-profile-logout"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? 'बाहेर पडा' : 'Logout'}</span>
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {successMessage && (
          <div
            id="profile-success-banner"
            className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 text-xs font-bold shadow-xs animate-in fade-in"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div
            id="profile-error-banner"
            className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center gap-3 text-xs font-bold shadow-xs animate-in fade-in"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0F6B4F] to-[#148362] p-6 sm:p-8 text-white relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
              
              {/* Profile Photo Section */}
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white/90 shadow-md bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                    {photoPreview ? (
                      <img
                        id="patient-avatar-image"
                        src={photoPreview}
                        alt={formData.name || 'Patient Avatar'}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      /* Default Neutral Avatar (No hardcoded photo) */
                      <div id="patient-neutral-avatar" className="w-full h-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                        <User className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  {/* Camera overlay button to select photo */}
                  <button
                    id="btn-select-profile-photo"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Change Profile Photo"
                    className="absolute bottom-1 right-1 p-2 bg-[#0F6B4F] text-white rounded-full border-2 border-white shadow-lg hover:bg-emerald-700 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  <input
                    ref={fileInputRef}
                    id="patient-photo-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </div>

                <div>
                  <h1 id="patient-profile-title-name" className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {formData.name || (language === 'mr' ? 'नागरिक रुग्ण' : 'Citizen Patient')}
                  </h1>
                  <p className="text-xs text-emerald-100 mt-1 flex items-center justify-center sm:justify-start gap-2">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{language === 'mr' ? 'प्रमाणित रुग्ण खाते' : 'Verified Patient Account'}</span>
                    {currentUser?.abhaId && (
                      <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-mono">
                        ABHA: {currentUser.abhaId}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons in Header */}
              <div className="flex items-center gap-2 shrink-0">
                {!isEditing ? (
                  <button
                    id="btn-edit-profile"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-[#0F6B4F] hover:bg-emerald-50 transition-all shadow-sm cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{language === 'mr' ? 'माहिती बदला' : 'Edit Profile'}</span>
                  </button>
                ) : (
                  <button
                    id="btn-cancel-edit"
                    onClick={handleCancelEdit}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>{language === 'mr' ? 'रद्द करा' : 'Cancel'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* If a new photo was selected, show instant upload bar */}
            {selectedPhotoFile && (
              <div className="mt-4 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-emerald-100">
                  {language === 'mr' ? 'नवीन फोटो निवडला आहे. जतन करण्यासाठी अपलोड करा.' : 'New photo selected. Upload to save to database.'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-upload-photo-now"
                    onClick={handleUploadPhoto}
                    disabled={isUploadingPhoto}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#0F6B4F] font-bold rounded-lg hover:bg-emerald-50 transition-colors shadow-xs cursor-pointer"
                  >
                    {isUploadingPhoto ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{language === 'mr' ? 'फोटो जतन करा' : 'Save Photo'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPhotoFile(null);
                      setPhotoPreview(currentUser?.profilePhoto || currentUser?.avatar || null);
                    }}
                    className="p-1.5 hover:bg-white/20 rounded-lg text-white"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8">
            {isEditing ? (
              /* ================= EDIT MODE ================= */
              <form id="patient-profile-edit-form" onSubmit={handleSaveChanges} className="space-y-6">
                
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    {language === 'mr' ? 'वैयक्तिक माहिती संपादन' : 'Edit Personal Information'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'mr'
                      ? 'बदलेली सर्व माहिती थेट सुरक्षित डेटाबेसमध्ये सेव्ह होईल.'
                      : 'All updated information will be saved directly to the database.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label htmlFor="input-profile-name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {language === 'mr' ? 'पूर्ण नाव (Full Name) *' : 'Full Name *'}
                    </label>
                    <input
                      id="input-profile-name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={language === 'mr' ? 'उदा. शांताबाई गावंडे' : 'e.g. Shantabai Gawande'}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label htmlFor="input-profile-age" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {language === 'mr' ? 'वय (Age)' : 'Age'}
                    </label>
                    <input
                      id="input-profile-age"
                      name="age"
                      type="number"
                      min="1"
                      max="120"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="e.g. 48"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label htmlFor="input-profile-dob" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {language === 'mr' ? 'जन्मतारीख (Date of Birth)' : 'Date of Birth'}
                    </label>
                    <input
                      id="input-profile-dob"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label htmlFor="input-profile-gender" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {language === 'mr' ? 'लिंग (Gender)' : 'Gender'}
                    </label>
                    <select
                      id="input-profile-gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
                    >
                      <option value="Female">{language === 'mr' ? 'स्त्री (Female)' : 'Female'}</option>
                      <option value="Male">{language === 'mr' ? 'पुरुष (Male)' : 'Male'}</option>
                      <option value="Other">{language === 'mr' ? 'इतर (Other)' : 'Other'}</option>
                    </select>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label htmlFor="input-profile-mobile" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {language === 'mr' ? 'मोबाईल क्रमांक (Mobile Number) *' : 'Mobile Number *'}
                    </label>
                    <input
                      id="input-profile-mobile"
                      name="mobileNumber"
                      type="tel"
                      required
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      placeholder="+91 99999 99999"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Village / Town */}
                  <div>
                    <label htmlFor="input-profile-village" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {language === 'mr' ? 'गाव / परिसर (Village)' : 'Village'}
                    </label>
                    <input
                      id="input-profile-village"
                      name="village"
                      type="text"
                      value={formData.village}
                      onChange={handleChange}
                      placeholder={language === 'mr' ? 'उदा. रामटेक' : 'e.g. Ramtek'}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <label htmlFor="input-profile-emergency" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {language === 'mr' ? 'आपत्कालीन संपर्क (Emergency Contact)' : 'Emergency Contact'}
                    </label>
                    <input
                      id="input-profile-emergency"
                      name="emergencyContact"
                      type="tel"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      placeholder="+91 98221 55667"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label htmlFor="input-profile-address" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {language === 'mr' ? 'पत्ता (Full Address)' : 'Address'}
                    </label>
                    <textarea
                      id="input-profile-address"
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      placeholder={language === 'mr' ? 'घर क्रमांक, गल्ली, गाव, तालुका, जिल्हा' : 'House No., Ward, Village, Taluka, District'}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Form Action Controls */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                  <button
                    id="btn-cancel-profile-form"
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    {language === 'mr' ? 'रद्द करा' : 'Cancel'}
                  </button>

                  <button
                    id="btn-save-profile"
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0F6B4F] hover:bg-emerald-800 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>{language === 'mr' ? 'बदल जतन करा (Save Changes)' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* ================= VIEW MODE ================= */
              <div id="patient-profile-view-details" className="space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {language === 'mr' ? 'नोंदणीकृत तपशील' : 'Registered Details'}
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {language === 'mr' ? 'डेटाबेस समक्रमित' : 'Database Synced'}
                  </span>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Full Name */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1">
                      {language === 'mr' ? 'पूर्ण नाव' : 'Full Name'}
                    </div>
                    <div id="display-profile-name" className="text-sm font-bold text-slate-900 dark:text-white">
                      {formData.name || '-'}
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{language === 'mr' ? 'मोबाईल क्रमांक' : 'Mobile Number'}</span>
                    </div>
                    <div id="display-profile-mobile" className="text-sm font-bold text-slate-900 dark:text-white">
                      {formData.mobileNumber || '-'}
                    </div>
                  </div>

                  {/* Age & Date of Birth */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{language === 'mr' ? 'वय व जन्मतारीख' : 'Age & Date of Birth'}</span>
                    </div>
                    <div id="display-profile-age-dob" className="text-sm font-bold text-slate-900 dark:text-white">
                      {formData.age ? `${formData.age} yrs` : ''} 
                      {formData.dateOfBirth ? ` (${formData.dateOfBirth})` : (!formData.age ? '-' : '')}
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1">
                      {language === 'mr' ? 'लिंग' : 'Gender'}
                    </div>
                    <div id="display-profile-gender" className="text-sm font-bold text-slate-900 dark:text-white">
                      {formData.gender || '-'}
                    </div>
                  </div>

                  {/* Village / Location */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{language === 'mr' ? 'गाव / परिसर' : 'Village'}</span>
                    </div>
                    <div id="display-profile-village" className="text-sm font-bold text-slate-900 dark:text-white">
                      {formData.village || '-'}
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      <span>{language === 'mr' ? 'आपत्कालीन संपर्क' : 'Emergency Contact'}</span>
                    </div>
                    <div id="display-profile-emergency" className="text-sm font-bold text-slate-900 dark:text-white">
                      {formData.emergencyContact || '-'}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1">
                      {language === 'mr' ? 'पत्ता' : 'Full Address'}
                    </div>
                    <div id="display-profile-address" className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                      {formData.address || (language === 'mr' ? 'पत्ता नोंदवला नाही' : 'Address not specified')}
                    </div>
                  </div>

                </div>

                {/* Edit Button at Bottom */}
                <div className="pt-2 flex justify-end">
                  <button
                    id="btn-edit-profile-bottom"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0F6B4F] hover:bg-emerald-800 transition-all shadow-xs cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{language === 'mr' ? 'माहिती संपादित करा (Edit Profile)' : 'Edit Profile'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
