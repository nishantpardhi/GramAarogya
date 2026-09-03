import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Video,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  User,
  RefreshCw,
  FileText,
  Stethoscope,
  Plus,
  Trash2,
  Eye,
  MapPin,
  Check
} from 'lucide-react';
import { Appointment } from '../types';

interface PrescribedMed {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
  isGovtSupply: boolean;
}

export const DoctorDashboardPage: React.FC = () => {
  const { t, currentUser, language, apiClient, setCurrentPage, createPrescription } = useApp();
  const [activeTab, setActiveTab] = useState<'appointments' | 'telemedicine' | 'completed'>('appointments');
  const [requests, setRequests] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Status states
  const [isLive, setIsLive] = useState(true);

  // Modals
  const [selectedPatientAppt, setSelectedPatientAppt] = useState<Appointment | null>(null);
  const [consultModalAppt, setConsultModalAppt] = useState<Appointment | null>(null);

  // Consult / Diagnosis form
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalAdvice, setClinicalAdvice] = useState('');
  const [medicines, setMedicines] = useState<PrescribedMed[]>([
    { name: 'Paracetamol 500mg', dosage: '1 tablet twice daily', duration: '3 days', instructions: 'After meals', isGovtSupply: true },
  ]);
  const [isSubmittingPrescription, setIsSubmittingPrescription] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchRequests();
    checkDoctorAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, activeTab]);

  const checkDoctorAvailability = async () => {
    if (!currentUser?.id) return;
    try {
      const res = await apiClient.getDoctorAvailability(currentUser.id);
      if (res.success && res.data) {
        setIsLive(res.data.status === 'available');
      }
    } catch {
      // Default to live
    }
  };

  const handleToggleLive = async () => {
    if (!currentUser?.id) return;
    const nextState = !isLive;
    setIsUpdatingStatus(true);
    try {
      await apiClient.updateDoctorAvailability(currentUser.id, {
        status: nextState ? 'available' : 'off_duty',
        activeShift: nextState ? 'OPD Active' : 'Off Duty',
      });
      setIsLive(nextState);
    } catch (err) {
      console.error('Failed to toggle availability', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.getAppointments({ doctorId: currentUser?.id });
      if (res.success && res.data) {
        let filtered = res.data;
        if (activeTab === 'telemedicine') {
          filtered = res.data.filter(app => app.consultationType === 'Telemedicine (Video)');
        } else if (activeTab === 'completed') {
          filtered = res.data.filter(app => app.status === 'Completed');
        } else {
          filtered = res.data.filter(app => app.consultationType !== 'Telemedicine (Video)');
        }
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setRequests(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string, notes?: string) => {
    try {
      await apiClient.updateAppointmentStatus(id, { status, doctorNotes: notes });
      fetchRequests();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // Open Consult & Diagnosis Modal
  const handleOpenConsultModal = (appt: Appointment) => {
    setConsultModalAppt(appt);
    setDiagnosis(appt.diagnosis || '');
    setClinicalAdvice(appt.doctorNotes || '');
    setMedicines([
      { name: 'Paracetamol 500mg', dosage: '1 tablet twice daily', duration: '3 days', instructions: 'After meals with water', isGovtSupply: true },
    ]);
    setSubmitSuccess(false);
  };

  const handleAddMedicineRow = () => {
    setMedicines([
      ...medicines,
      { name: '', dosage: '1 tablet daily', duration: '3 days', instructions: 'After food', isGovtSupply: true },
    ]);
  };

  const handleRemoveMedicineRow = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index: number, field: keyof PrescribedMed, value: any) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  // Submit Prescription and Complete Consultation
  const handleSubmitConsultation = async () => {
    if (!consultModalAppt || !diagnosis.trim()) {
      alert(t('auto.text_1281'));
      return;
    }

    setIsSubmittingPrescription(true);
    try {
      const validMeds = medicines.filter(m => m.name.trim().length > 0);

      const prescriptionPayload: any = {
        patientId: consultModalAppt.patientId,
        patientName: consultModalAppt.patientName,
        patientAge: consultModalAppt.patientAge,
        patientGender: consultModalAppt.patientGender,
        doctorId: currentUser?.id,
        doctorName: currentUser?.name || 'Dr. Medical Officer',
        doctorSpecialization: currentUser?.specialization || 'Medical Officer',
        facilityId: consultModalAppt.facilityId,
        facilityName: consultModalAppt.facilityName || 'Primary Health Centre',
        diagnosis: diagnosis.trim(),
        doctorNotes: clinicalAdvice.trim(),
        appointmentId: consultModalAppt.id,
        date: new Date().toISOString().split('T')[0],
        medicines: validMeds.map(m => ({
          medicineName: m.name,
          dosage: m.dosage,
          duration: m.duration,
          timing: m.instructions,
          governmentSupply: m.isGovtSupply,
        })),
        isDigitallySigned: true,
        signedAt: new Date().toISOString(),
      };

      // 1. Update appointment status to Completed with diagnosis & notes
      await apiClient.updateAppointmentStatus(consultModalAppt.id, {
        status: 'Completed',
        diagnosis: diagnosis.trim(),
        doctorNotes: clinicalAdvice.trim(),
        prescription: prescriptionPayload,
      });

      // 2. Register digital prescription
      try {
        await apiClient.createPrescription(prescriptionPayload);
      } catch {
        // Fallback context registration
        if (createPrescription) {
          createPrescription(prescriptionPayload);
        }
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        setConsultModalAppt(null);
        fetchRequests();
      }, 1200);
    } catch (err) {
      console.error('Failed to submit consultation', err);
      alert('Failed to complete consultation. Please try again.');
    } finally {
      setIsSubmittingPrescription(false);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const confirmedRequests = requests.filter(r => r.status === 'Confirmed');
  const completedRequests = requests.filter(r => r.status === 'Completed');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-xl">
                <Stethoscope className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {t('auto.text_1282')}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {currentUser?.name} • {currentUser?.specialization || 'General Physician / Medical Officer'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
                isLive
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              {isLive ? (t('auto.text_1283')) : (t('auto.text_1284'))}
            </span>
            <button
              onClick={handleToggleLive}
              disabled={isUpdatingStatus}
              className={`px-4 py-2 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-sm ${
                isLive ? 'bg-slate-700 hover:bg-slate-800' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isLive ? (t('auto.text_1285')) : (t('auto.text_1286'))}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 bg-slate-200/60 dark:bg-slate-800/60 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'appointments'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            {t('auto.text_1287')}
            {pendingRequests.length > 0 && activeTab !== 'telemedicine' && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('telemedicine')}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'telemedicine'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            {t('auto.text_1288')}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            {t('auto.text_1289')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main List Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                {activeTab === 'completed'
                  ? (t('auto.text_1290'))
                  : (t('auto.text_1291'))}
                <span className="text-xs font-normal text-slate-500">
                  ({activeTab === 'completed' ? completedRequests.length : pendingRequests.length})
                </span>
              </h2>
              <button
                onClick={fetchRequests}
                className="p-2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* List */}
            {activeTab === 'completed' ? (
              completedRequests.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center">
                  <p className="text-slate-500 text-sm">
                    {t('auto.text_1292')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {completedRequests.map(req => (
                    <div
                      key={req.id}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {req.patientName}
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                              {req.patientAge} yrs • {req.patientGender}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                            <span>{req.date}</span>
                            <span>{req.timeSlot}</span>
                            <span className="font-mono text-emerald-600 font-bold">Token #{req.tokenNumber}</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Consulted
                        </span>
                      </div>

                      {req.diagnosis && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-xl p-3 text-xs">
                          <span className="font-bold text-blue-900 dark:text-blue-300">Clinical Diagnosis: </span>
                          <span className="text-blue-800 dark:text-blue-200 font-medium">{req.diagnosis}</span>
                          {req.doctorNotes && (
                            <p className="mt-1 text-slate-600 dark:text-slate-400">
                              <strong>Advice:</strong> {req.doctorNotes}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => setSelectedPatientAppt(req)}
                          className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Details
                        </button>
                        <button
                          onClick={() => handleOpenConsultModal(req)}
                          className="px-3 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" /> Edit Prescription
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : pendingRequests.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-slate-700 dark:text-slate-300 font-bold">
                  {t('auto.text_1293')}
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  {t('auto.text_1294')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map(req => (
                  <div
                    key={req.id}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {req.patientName}
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                            {req.patientAge} yrs • {req.patientGender}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" /> {req.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-blue-600" /> {req.timeSlot}
                          </span>
                          <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
                            {req.consultationType}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Symptoms / Concern: </span>
                          {req.reason || 'General health checkup'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedPatientAppt(req)}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        title="View Patient Info"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(req.id, 'Cancelled')}
                        className="px-3 py-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" /> {t('auto.text_1295')}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(req.id, 'Confirmed')}
                        className="px-3 py-1.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" /> {t('auto.text_1296')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Confirmed & Active Consultations */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {t('auto.text_1297')}
            </h2>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
              {confirmedRequests.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">
                  {t('auto.text_1298')}
                </div>
              ) : (
                <div className="space-y-3">
                  {confirmedRequests.slice(0, 6).map(req => (
                    <div
                      key={req.id}
                      className="pb-3 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white">{req.patientName}</div>
                          <div className="text-xs text-slate-500">
                            {req.patientAge} yrs • {req.patientGender}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                          Token #{req.tokenNumber}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 mt-1 flex justify-between">
                        <span>{req.timeSlot}</span>
                        <span>{req.date}</span>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
                        <strong>Reason:</strong> {req.reason || 'General checkup'}
                      </div>

                      {/* Action Buttons for Doctor */}
                      <div className="mt-2.5 flex items-center gap-2">
                        {req.consultationType === 'Telemedicine (Video)' && (
                          <button
                            onClick={() => setCurrentPage('telemedicine', { appointmentId: req.id })}
                            className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5" /> Join Video Call
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenConsultModal(req)}
                          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Stethoscope className="w-3.5 h-3.5" /> Consult & Prescribe
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: VIEW PATIENT DETAILS */}
      {selectedPatientAppt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {selectedPatientAppt.patientName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Token #{selectedPatientAppt.tokenNumber} • {selectedPatientAppt.consultationType}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatientAppt(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                <div>
                  <span className="text-xs text-slate-500 block">Age & Gender</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedPatientAppt.patientAge} years, {selectedPatientAppt.patientGender}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Date & Time</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedPatientAppt.date} ({selectedPatientAppt.timeSlot})
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Reported Symptoms / Reason
                </span>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-amber-900 dark:text-amber-200">
                  {selectedPatientAppt.reason || 'No specific symptoms recorded'}
                </div>
              </div>

              {selectedPatientAppt.diagnosis && (
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Prior Recorded Diagnosis
                  </span>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl text-blue-900 dark:text-blue-200">
                    {selectedPatientAppt.diagnosis}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
              <button
                onClick={() => setSelectedPatientAppt(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const appt = selectedPatientAppt;
                  setSelectedPatientAppt(null);
                  handleOpenConsultModal(appt);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Stethoscope className="w-4 h-4" /> Start Diagnosis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CLINICAL DIAGNOSIS & PRESCRIPTION ISSUANCE */}
      {consultModalAppt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {t('auto.text_1299')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Patient: {consultModalAppt.patientName} ({consultModalAppt.patientAge} yrs • {consultModalAppt.patientGender})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConsultModalAppt(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  {t('auto.text_1300')}
                </h4>
                <p className="text-sm text-slate-500">
                  {t('auto.text_1301')}
                </p>
              </div>
            ) : (
              <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {/* Patient reported problem */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Patient Reported Symptoms:
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    {consultModalAppt.reason || 'General health concern reported.'}
                  </p>
                </div>

                {/* Clinical Diagnosis Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {t('auto.text_1302')}
                  </label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={e => setDiagnosis(e.target.value)}
                    placeholder="e.g. Acute Viral Bronchitis, Mild Dehydration, Allergic Dermatitis"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>

                {/* Doctor's Advice / Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {t('auto.text_1303')}
                  </label>
                  <textarea
                    rows={2}
                    value={clinicalAdvice}
                    onChange={e => setClinicalAdvice(e.target.value)}
                    placeholder="e.g. Drink boiled water, avoid cold items, review after 3 days if symptoms persist"
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>

                {/* Prescribed Medicines */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {t('auto.text_1304')}
                    </label>
                    <button
                      type="button"
                      onClick={handleAddMedicineRow}
                      className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> {t('auto.text_1305')}
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {medicines.map((med, index) => (
                      <div
                        key={index}
                        className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={med.name}
                            onChange={e => handleMedicineChange(index, 'name', e.target.value)}
                            placeholder="Medicine Name (e.g. Paracetamol 500mg, Amoxicillin 500mg)"
                            className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                          />
                          {medicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMedicineRow(index)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={e => handleMedicineChange(index, 'dosage', e.target.value)}
                            placeholder="Dosage (e.g. 1 tab twice daily)"
                            className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                          />
                          <input
                            type="text"
                            value={med.duration}
                            onChange={e => handleMedicineChange(index, 'duration', e.target.value)}
                            placeholder="Duration (e.g. 3 days, 5 days)"
                            className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                          />
                          <input
                            type="text"
                            value={med.instructions}
                            onChange={e => handleMedicineChange(index, 'instructions', e.target.value)}
                            placeholder="Timing (e.g. After meals)"
                            className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="checkbox"
                            id={`govt-${index}`}
                            checked={med.isGovtSupply}
                            onChange={e => handleMedicineChange(index, 'isGovtSupply', e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <label htmlFor={`govt-${index}`} className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                            {t('auto.text_1306')}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Digital Signature Notice */}
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-xs flex items-center justify-between text-emerald-800 dark:text-emerald-300">
                  <span>
                    ✍️ Digitally signed by {currentUser?.name} (Medical Council Reg. Active)
                  </span>
                  <span className="font-mono text-[10px] bg-emerald-200 dark:bg-emerald-900 px-2 py-0.5 rounded">
                    VERIFIED
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultModalAppt(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingPrescription}
                    onClick={handleSubmitConsultation}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingPrescription ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        {t('auto.text_1307')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
