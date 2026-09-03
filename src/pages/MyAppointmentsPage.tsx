import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Video,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Stethoscope,
  Printer,
  ChevronRight,
  Pill,
  Building2,
  Sparkles
} from 'lucide-react';
import { Appointment } from '../types';

export const MyAppointmentsPage: React.FC = () => {
  const { currentUser, language, apiClient, setCurrentPage } = useApp();
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPrescriptionAppt, setSelectedPrescriptionAppt] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.getAppointments({ patientId: currentUser?.id });
      if (res.success && res.data) {
        setMyAppointments(
          res.data.sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Top Banner */}
      <div className="bg-[#0F6B4F] text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {language === 'mr' ? 'माझ्या अपॉइंटमेंट्स व प्रिस्क्रिप्शन' : 'My Appointments & Prescriptions'}
              </h1>
              <p className="text-emerald-100 font-medium mt-1 text-sm sm:text-base">
                {language === 'mr'
                  ? 'तुमच्या सर्व डॉक्टर्स तपासण्या, निदान आणि डिजिटल औषध चिठ्ठ्या'
                  : 'Track your doctor consultations, clinical diagnoses, and prescriptions'}
              </p>
            </div>
            <button
              onClick={() => setCurrentPage('facilities')}
              className="px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-sm font-bold shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
            >
              + {language === 'mr' ? 'नवीन अपॉइंटमेंट' : 'Book Consultation'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F6B4F]"></div>
          </div>
        ) : myAppointments.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
              {language === 'mr' ? 'कोणत्याही अपॉइंटमेंट नाहीत' : 'No Consultations Found'}
            </h3>
            <p className="text-slate-500 mt-1 text-sm max-w-sm mx-auto">
              {language === 'mr'
                ? 'तुम्ही अद्याप डॉक्टरांची भेट किंवा टेलिमेडिसिन अपॉइंटमेंट बुक केलेली नाही.'
                : 'You have not booked any appointments or telemedicine consultations yet.'}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setCurrentPage('ai-assistant')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                {language === 'mr' ? 'लक्षणे सांगून डॉक्टर शोधा' : 'Describe Symptoms & Find Doctor'}
              </button>
              <button
                onClick={() => setCurrentPage('facilities')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-bold cursor-pointer"
              >
                {language === 'mr' ? 'आरोग्य केंद्रे पहा' : 'View Healthcare Facilities'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {myAppointments.map(app => {
              const isCompleted = app.status === 'Completed';
              const isConfirmed = app.status === 'Confirmed';
              const hasPrescriptionOrDiagnosis = Boolean(app.diagnosis || app.prescription);

              return (
                <div
                  key={app.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow transition-shadow flex flex-col gap-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                            app.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                              : app.status === 'Confirmed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : app.status === 'Completed'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {app.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {app.status}
                        </span>
                        <span className="text-xs font-bold bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-lg border border-purple-100 dark:border-purple-900/40">
                          {app.consultationType}
                        </span>
                        <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-mono">
                          Token #{app.tokenNumber}
                        </span>
                      </div>

                      <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        {app.doctorName}
                      </h3>
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        {app.doctorSpecialization}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {app.facilityName}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {app.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" /> {app.timeSlot}
                        </span>
                      </div>

                      {app.reason && (
                        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg inline-block">
                          <strong className="text-slate-700 dark:text-slate-300">Symptoms / Intake:</strong> {app.reason}
                        </div>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-col sm:items-end justify-center gap-2 shrink-0">
                      {app.consultationType === 'Telemedicine (Video)' && isConfirmed && (
                        <button
                          onClick={() => setCurrentPage('telemedicine', { appointmentId: app.id })}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                        >
                          <Video className="w-4 h-4" />
                          {language === 'mr' ? 'व्हिडिओ कॉल सुरू करा' : 'Join Video Call'}
                        </button>
                      )}

                      {hasPrescriptionOrDiagnosis && (
                        <button
                          onClick={() => setSelectedPrescriptionAppt(app)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                        >
                          <FileText className="w-4 h-4" />
                          {language === 'mr' ? 'डिजिटल प्रिस्क्रिप्शन पहा' : 'View Prescription'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Diagnosis & Advice Highlight if Completed */}
                  {isCompleted && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-3 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-300 mb-1">
                        <Stethoscope className="w-4 h-4 text-emerald-600" />
                        <span>Doctor's Clinical Diagnosis: {app.diagnosis || 'Clinical evaluation completed'}</span>
                      </div>
                      {app.doctorNotes && (
                        <p className="text-emerald-800 dark:text-emerald-200">
                          <strong>Advice:</strong> {app.doctorNotes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PRESCRIPTION DETAIL MODAL */}
      {selectedPrescriptionAppt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            {/* Header / Header Slip */}
            <div className="border-b-2 border-slate-200 dark:border-slate-700 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded">
                    Govt. of Maharashtra Health Services • PHC / CHC OPD
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {selectedPrescriptionAppt.facilityName || 'Primary Health Centre'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Consulting Doctor: {selectedPrescriptionAppt.doctorName} ({selectedPrescriptionAppt.doctorSpecialization})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPrescriptionAppt(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Patient Details Row */}
            <div className="py-4 border-b border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl my-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {selectedPrescriptionAppt.patientName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Age / Gender</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {selectedPrescriptionAppt.patientAge} Y / {selectedPrescriptionAppt.patientGender}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Token No</span>
                <span className="font-mono font-bold text-emerald-600">
                  #{selectedPrescriptionAppt.tokenNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Date</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {selectedPrescriptionAppt.date}
                </span>
              </div>
            </div>

            {/* Clinical Diagnosis */}
            <div className="mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Clinical Diagnosis & Findings
              </span>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl text-sm font-semibold text-blue-900 dark:text-blue-200">
                {selectedPrescriptionAppt.diagnosis || 'Clinical evaluation completed'}
              </div>
            </div>

            {/* Doctor Advice */}
            {selectedPrescriptionAppt.doctorNotes && (
              <div className="mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Doctor's Instructions & Care
                </span>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                  {selectedPrescriptionAppt.doctorNotes}
                </div>
              </div>
            )}

            {/* Prescribed Medicines Table */}
            <div className="mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Pill className="w-3.5 h-3.5 text-emerald-600" /> Prescribed Medicines (Rx)
              </span>

              {selectedPrescriptionAppt.prescription?.medicines && selectedPrescriptionAppt.prescription.medicines.length > 0 ? (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      <tr>
                        <th className="p-2.5">Medicine</th>
                        <th className="p-2.5">Dosage</th>
                        <th className="p-2.5">Duration</th>
                        <th className="p-2.5">Timing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedPrescriptionAppt.prescription.medicines.map((med: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                            {med.medicineName || med.name}
                            {med.governmentSupply && (
                              <span className="block text-[10px] text-emerald-600 font-semibold">
                                ✓ Free PHC Supply
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300">{med.dosage}</td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300">{med.duration}</td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300">{med.timing || med.instructions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-500">
                  Clinical advice recorded; medicine dispensed as per OPD protocol.
                </div>
              )}
            </div>

            {/* Signature Slip */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-500">
              <div>
                <span className="font-semibold block text-slate-700 dark:text-slate-300">
                  {selectedPrescriptionAppt.doctorName}
                </span>
                <span className="text-[10px]">Digitally verified • MMC Reg. Verified</span>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
