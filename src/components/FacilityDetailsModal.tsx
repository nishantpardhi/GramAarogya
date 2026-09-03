import React from 'react';
import { useApp } from '../context/AppContext';
import { Facility } from '../types';
import { X, MapPin, Phone, Clock, Stethoscope, Video, Building2 } from 'lucide-react';

interface FacilityDetailsModalProps {
  facility: Facility | null;
  onClose: () => void;
}

export const FacilityDetailsModal: React.FC<FacilityDetailsModalProps> = ({ facility, onClose }) => {
  const { language, doctors, setCurrentPage, formatDistance, formatNumber } = useApp();

  if (!facility) return null;

  // Filter doctors that belong to this facility
  const facilityDoctors = doctors.filter((doc) => doc.facilityId === facility.id);

  const handleRequestTelemedicine = (doctorId: string) => {
    onClose();
    setCurrentPage('appointments', { doctorId });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {facility.type}
              </span>
              {facility.is24x7Emergency && (
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                  ⚡ 24x7 Emergency
                </span>
              )}
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {language === 'mr' ? facility.nameMr : facility.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {facility.villageOrCity}, {facility.taluka}, {facility.district}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Facility Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {language === 'mr' ? 'OPD वेळ' : 'OPD Timings'}
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                09:00 AM - 02:00 PM
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {language === 'mr' ? 'अंतर' : 'Distance'}
              </div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatDistance(facility.distanceKm)}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-300">
             <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
               <span>{language === 'mr' ? 'एकूण खाटा' : 'Total Beds'}:</span>
               <span className="font-bold">{formatNumber(facility.bedsTotal)}</span>
             </div>
             <div className="flex justify-between">
               <span>{language === 'mr' ? 'उपलब्ध खाटा' : 'Available Beds'}:</span>
               <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(facility.bedsAvailable)}</span>
             </div>
          </div>

          {/* Doctors List */}
          <div>
            <h3 className="text-sm font-black uppercase text-slate-500 mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              {language === 'mr' ? 'उपलब्ध डॉक्टर्स' : 'Available Doctors'}
            </h3>
            
            {facilityDoctors.length === 0 ? (
              <div className="text-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <p className="text-sm text-slate-500">
                  {language === 'mr' 
                    ? 'या केंद्रावर सध्या डॉक्टर उपलब्ध नाहीत.' 
                    : 'No verified doctors currently available at this facility.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {facilityDoctors.map(doc => (
                  <div key={doc.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-emerald-300 transition-colors">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        {language === 'mr' ? doc.nameMr : doc.name}
                        {doc.isAvailableToday !== false ? (
                           <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">🟢 {language === 'mr' ? 'उपलब्ध' : 'Available'}</span>
                        ) : (
                           <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">⚪ {language === 'mr' ? 'व्यस्त' : 'Offline'}</span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{doc.specialization}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        ⏰ {doc.opdTimings || '09:00 AM - 02:00 PM'}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleRequestTelemedicine(doc.id)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Video className="w-3.5 h-3.5" />
                        {language === 'mr' ? 'टेलिमेडिसिन विनंती' : language === 'hi' ? 'टेलीमेडिसिन अनुरोध' : 'Request Telemedicine'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="pt-4 flex items-center justify-end">
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`}
              target="_blank" rel="noopener noreferrer"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Building2 className="w-4 h-4" />
              {language === 'mr' ? 'प्रत्यक्ष भेट द्या (दिशा)' : 'Visit Offline (Directions)'}
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};
