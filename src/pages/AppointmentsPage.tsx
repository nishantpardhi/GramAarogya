import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  CheckCircle2,
  Video,
  Building2,
  ShieldCheck,
} from 'lucide-react';

export const AppointmentsPage: React.FC = () => {
  const { t, currentUser,
    bookAppointment,
    doctors,
    language,
    formatDate,
    showToast,
    setCurrentPage,
    pageParams,
    refreshData, } = useApp();

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(pageParams?.doctorId || doctors[0]?.id || '');
  const [patientName, setPatientName] = useState(currentUser?.name || '');
  const [patientMobile, setPatientMobile] = useState(currentUser?.mobile || '');
  const [patientAge, setPatientAge] = useState(currentUser?.age ? String(currentUser.age) : '32');
  const [appointmentType, setAppointmentType] = useState<'telemedicine'>('telemedicine');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('10:30 AM - 11:00 AM');
  const [reason, setReason] = useState(pageParams?.reason || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedRequest, setBookedRequest] = useState<{ requestId: string; doctorName: string; date: string } | null>(null);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

  const timeSlots = [
    '09:00 AM - 09:30 AM',
    '09:30 AM - 10:00 AM',
    '10:00 AM - 10:30 AM',
    '10:30 AM - 11:00 AM',
    '11:00 AM - 11:30 AM',
    '11:30 AM - 12:00 PM',
    '02:00 PM - 02:30 PM',
    '02:30 PM - 03:00 PM',
    '03:00 PM - 03:30 PM',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientMobile) {
      showToast(
        t('auto.text_1253')
      );
      return;
    }
    if (!selectedDoctor) {
      showToast(
        t('auto.text_1254')
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const appt = await bookAppointment({
        patientId: currentUser?.id || 'guest-patient',
        patientName,
        patientMobile,
        patientAge: Number(patientAge) || 30,
        patientVillage: currentUser?.village || 'Ramtek',
        doctorId: selectedDoctor.id,
        doctorName: language === 'mr' ? selectedDoctor.nameMr || selectedDoctor.name : selectedDoctor.name,
        doctorSpecialization: selectedDoctor.specialization,
        facilityId: selectedDoctor.facilityId,
        facilityName: selectedDoctor.facilityName,
        date,
        timeSlot,
        consultationType: appointmentType === 'telemedicine' ? 'Telemedicine (Video)' : 'In-Person (OPD)',
        reason: reason || 'General checkup',
        symptoms: reason ? [reason] : ['General checkup'],
      });

      setBookedRequest({
        requestId: appt.tokenNumber,
        doctorName: language === 'mr' ? selectedDoctor.nameMr || selectedDoctor.name : selectedDoctor.name,
        date,
      });
    } catch {
      showToast(
        t('auto.text_1255')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      {/* Header */}
      <div className="bg-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-800 px-3 py-1 rounded-full border border-indigo-600">
            <Video className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {t('auto.text_1256')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {t('auto.text_1257')}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
            {t('auto.text_1258')}
          </p>
        </div>
      </div>

      {/* Data Source Transparency Banner */}

      {bookedRequest ? (
        /* Booking Pending Card */
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-amber-300 dark:border-amber-700 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/60 rounded-full flex items-center justify-center mx-auto text-amber-600 dark:text-amber-300">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              {t('auto.text_1259')}
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {t('auto.text_1260')}
            </h2>
          </div>

          <div className="inline-block bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-500 rounded-3xl px-8 py-5">
            <div className="text-xs text-amber-600 dark:text-amber-300 font-bold uppercase">
              {t('auto.text_1261')}
            </div>
            <div className="text-4xl sm:text-5xl font-black text-amber-900 dark:text-amber-200 font-mono my-1">
              {bookedRequest.requestId}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {bookedRequest.doctorName} • {formatDate(bookedRequest.date)}
            </div>
          </div>

          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {t('auto.text_1262')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setBookedRequest(null)}
              className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-slate-800 dark:text-slate-200"
            >
              {t('auto.text_1263')}
            </button>
            <button
              onClick={() => setCurrentPage('patient-dashboard')}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-900/20 cursor-pointer"
            >
              {t('auto.text_1264')}
            </button>
          </div>
        </div>
      ) : (
        /* Booking Form */
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Consultation Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500 block">
                {t('auto.text_1265')}
              </label>
              <div className="grid grid-cols-1 gap-3">
                <div
                  className="p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm ring-2 ring-indigo-500/20"
                >
                  <Video className="w-5 h-5 text-indigo-600" />
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {t('auto.text_1266')}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {t('auto.text_1267')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500 block">
                {t('auto.text_1268')}
              </label>

              {doctors.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {t('auto.text_1269')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {t('auto.text_1270')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {doctors.slice(0, 6).map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        selectedDoctor?.id === doc.id
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0">
                        DR
                      </div>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {language === 'mr' ? doc.nameMr : doc.name}
                          </h4>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            doc.isAvailableToday !== false
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                          {doc.isAvailableToday !== false
                            ? (t('auto.text_1279'))
                            : (t('auto.text_1280'))}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">{doc.specialization}</div>
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium truncate">
                        🏥 {doc.facilityName}
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                        ⏰ {doc.opdTimings || '09:00 AM - 02:00 PM'} {doc.consultationType ? `• ${doc.consultationType}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>

            {/* Patient Details & Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold block mb-1 text-slate-800 dark:text-slate-200">
                  {t('auto.text_1271')}
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1 text-slate-800 dark:text-slate-200">
                  {t('auto.text_1272')}
                </label>
                <input
                  type="tel"
                  required
                  value={patientMobile}
                  onChange={(e) => setPatientMobile(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1 text-slate-800 dark:text-slate-200">
                  {t('auto.text_1273')}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1 text-slate-800 dark:text-slate-200">
                  {t('auto.text_1274')}
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1 text-slate-800 dark:text-slate-200">
                {t('auto.text_1275')}
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  t('auto.text_1276')
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-indigo-900 hover:bg-indigo-800 text-white font-black rounded-2xl shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {isSubmitting ? (
                <span>{t('auto.text_1277')}</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {t('auto.text_1278')}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
