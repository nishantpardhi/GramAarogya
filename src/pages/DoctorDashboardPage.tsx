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
  Phone,
  RefreshCw
} from 'lucide-react';
import { Appointment } from '../types';

export const DoctorDashboardPage: React.FC = () => {
  const { currentUser, language, appointments, apiClient, setCurrentPage } = useApp();
  const [activeTab, setActiveTab] = useState<'appointments' | 'telemedicine'>('appointments');
  const [requests, setRequests] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Status states
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, activeTab]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.getAppointments({ doctorId: currentUser?.id });
      if (res.success && res.data) {
        // Filter by tab
        const filtered = res.data.filter(app => {
          if (activeTab === 'telemedicine') return app.consultationType === 'Telemedicine (Video)';
          return app.consultationType !== 'Telemedicine (Video)';
        });
        // Sort by date (descending)
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRequests(filtered);
      }
    } catch (err) {
      console.error(err);
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

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const confirmedRequests = requests.filter(r => r.status === 'Confirmed' || r.status === 'Completed');
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {language === 'mr' ? 'डॉक्टर डॅशबोर्ड' : 'Doctor Dashboard'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {currentUser?.name} • {currentUser?.specialization || 'General Physician'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 ${isLive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              {isLive ? (language === 'mr' ? 'ऑनलाइन' : 'Available') : (language === 'mr' ? 'ऑफलाइन' : 'Offline')}
            </span>
            <button
              onClick={() => setIsLive(!isLive)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
            >
              {isLive ? (language === 'mr' ? 'ऑफलाइन जा' : 'Go Offline') : (language === 'mr' ? 'ऑनलाइन जा' : 'Go Online')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl inline-flex">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'appointments' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            {language === 'mr' ? 'अपॉइंटमेंट विनंत्या' : 'Appointment Requests'}
          </button>
          <button
            onClick={() => setActiveTab('telemedicine')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'telemedicine' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            {language === 'mr' ? 'टेलिमेडिसिन विनंत्या' : 'Telemedicine Requests'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {language === 'mr' ? 'प्रलंबित विनंत्या' : 'Pending Requests'}
              </h2>
              <button onClick={fetchRequests} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Refresh">
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-slate-700 dark:text-slate-300 font-bold">
                  {language === 'mr' ? 'कोणत्याही प्रलंबित विनंत्या नाहीत' : 'No pending requests'}
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  {language === 'mr' ? 'तुम्ही सर्व विनंत्या हाताळल्या आहेत.' : 'You have caught up with all requests.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map(req => (
                  <div key={req.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
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
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {req.date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {req.timeSlot}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1.5 line-clamp-1">
                          <strong>Reason:</strong> {req.reason}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleStatusUpdate(req.id, 'Cancelled')}
                        className="px-3 py-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" /> {language === 'mr' ? 'नाकारा' : 'Reject'}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(req.id, 'Confirmed')}
                        className="px-3 py-1.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" /> {language === 'mr' ? 'स्वीकारा' : 'Accept'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirmed Column */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {language === 'mr' ? 'आजचे शेड्युल' : 'Schedule'}
            </h2>
            
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
              {confirmedRequests.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">
                  {language === 'mr' ? 'कोणत्याही अपॉइंटमेंट नाहीत' : 'No upcoming appointments'}
                </div>
              ) : (
                <div className="space-y-3">
                  {confirmedRequests.slice(0, 5).map(req => (
                    <div key={req.id} className="pb-3 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-sm text-slate-900 dark:text-white">{req.patientName}</div>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                          {req.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex justify-between">
                        <span>{req.timeSlot}</span>
                        <span>{req.date}</span>
                      </div>
                      {req.consultationType === 'Telemedicine (Video)' && (
                        <button
                          onClick={() => setCurrentPage('telemedicine', { appointmentId: req.id })}
                          className="mt-2 w-full py-1.5 bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-purple-100 transition-colors"
                        >
                          <Video className="w-3.5 h-3.5" /> Join Call
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
