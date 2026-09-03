import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Video, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { Appointment } from '../types';

export const MyAppointmentsPage: React.FC = () => {
  const { currentUser, language, appointments, apiClient, setCurrentPage } = useApp();
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [currentUser]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.getAppointments({ patientId: currentUser?.id });
      if (res.success && res.data) {
        setMyAppointments(res.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      <div className="bg-[#0F6B4F] text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {language === 'mr' ? 'माझ्या अपॉइंटमेंट्स' : 'My Appointments'}
          </h1>
          <p className="text-emerald-100 font-medium mt-2">
            {language === 'mr' ? 'तुमच्या सर्व अपॉइंटमेंट विनंत्या आणि स्थिती' : 'Your appointment requests and their status'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F6B4F]"></div>
          </div>
        ) : myAppointments.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
              {language === 'mr' ? 'कोणत्याही अपॉइंटमेंट नाहीत' : 'No Appointments Found'}
            </h3>
            <p className="text-slate-500 mt-1">
              {language === 'mr' ? 'तुम्ही अद्याप कोणतीही अपॉइंटमेंट बुक केलेली नाही.' : 'You have not booked any appointments yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {myAppointments.map(app => (
              <div key={app.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      app.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      app.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                      app.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {app.status}
                    </span>
                    <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                      {app.consultationType}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{app.doctorName}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{app.doctorSpecialization}</p>
                  <p className="text-xs text-slate-500 mt-1">{app.facilityName}</p>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 font-medium"><Calendar className="w-4 h-4 text-emerald-600" /> {app.date}</div>
                    <div className="flex items-center gap-1.5 font-medium"><Clock className="w-4 h-4 text-emerald-600" /> {app.timeSlot}</div>
                  </div>
                </div>
                
                <div className="flex flex-col items-start md:items-end justify-center gap-2">
                  <div className="bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-xl text-center border border-slate-100 dark:border-slate-700 w-full md:w-auto">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Token No</div>
                    <div className="font-mono font-bold text-lg text-slate-900 dark:text-white">{app.tokenNumber}</div>
                  </div>
                  
                  {app.consultationType === 'Telemedicine (Video)' && app.status === 'Confirmed' && (
                    <button
                      onClick={() => setCurrentPage('telemedicine', { appointmentId: app.id })}
                      className="w-full md:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Video className="w-4 h-4" />
                      {language === 'mr' ? 'व्हिडिओ कॉल सुरू करा' : 'Join Video Call'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
