import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Facility, FacilityType } from '../types';
import { HealthcareMap } from '../components/HealthcareMap';
import { FacilityDetailsModal } from '../components/FacilityDetailsModal';
import {
  Building2,
  MapPin,
  Calendar,
  Search,
  Navigation,
  Map as MapIcon,
  LayoutGrid, AlertCircle,
} from 'lucide-react';

export const FacilitiesPage: React.FC = () => {
  const {
    language,
    formatNumber,
    formatDistance,
    setCurrentPage,
    facilities,
    doctors,
    refreshData,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [onlyEmergency, setOnlyEmergency] = useState(false);
  const [onlyFreeMeds, setOnlyFreeMeds] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('map');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation && !userCoords) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        () => {
          // Fallback handled by map or manual search
        }
      );
    }
  }, []);

  const facilityTypes: FacilityType[] = [
    'PHC',
    'CHC',
    'Sub-District Hospital',
    'District Hospital',
    'Government Medical College',
  ];

  const districts = ['ALL', 'Nagpur', 'Wardha', 'Gadchiroli', 'Nashik', 'Pune', 'Amravati', 'Chandrapur'];

  const filteredFacilities = (facilities || []).filter((f) => {
    if (!f) return false;
    const q = (searchQuery || '').trim().toLowerCase();
    const matchesSearch =
      !q ||
      (f.name || '').toLowerCase().includes(q) ||
      (f.nameMr || '').includes(searchQuery || '') ||
      (f.taluka || '').toLowerCase().includes(q) ||
      (f.villageOrCity || '').toLowerCase().includes(q);

    const matchesType = selectedType === 'ALL' || f.type === selectedType;
    const matchesDistrict =
      selectedDistrict === 'ALL' ||
      (f.district || '').toLowerCase() === (selectedDistrict || '').toLowerCase();
    const matchesEmergency = !onlyEmergency || Boolean(f.is24x7Emergency);
    const matchesFreeMeds = !onlyFreeMeds || Boolean(f.hasFreeMedicines);

    return matchesSearch && matchesType && matchesDistrict && matchesEmergency && matchesFreeMeds;
  });

  const handleFacilitySelectFromList = (facility: Facility) => {
    setSelectedFacilityId(facility.id);
    setViewMode('map');
  };

  const selectedFacility = facilities.find(f => f.id === selectedFacilityId) || null;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3 text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-700/80 px-3 py-1 rounded-full border border-emerald-500/40">
            <Building2 className="w-3.5 h-3.5" />
            <span>
              {language === 'mr'
                ? 'शासकीय आरोग्य संस्था व जीआयएस नकाशा'
                : language === 'hi'
                ? 'सरकारी स्वास्थ्य संस्थान व जीआईएस मानचित्र'
                : 'Public Healthcare Facilities & GIS Map'}
            </span>
      
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {language === 'mr'
              ? 'प्राथमिक आरोग्य केंद्र (PHC), ग्रामीण रुग्णालय (CHC) व जिल्हा रुग्णालये'
              : language === 'hi'
              ? 'प्राथमिक स्वास्थ्य केंद्र (PHC), सामुदायिक स्वास्थ्य केंद्र (CHC) व जिला अस्पताल'
              : 'Find Government PHC, CHC & District Hospitals'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            {language === 'mr'
              ? 'महाराष्ट्रातील सर्व शासकीय आरोग्य केंद्रांची २४x७ आपत्कालीन उपलब्धता, खाटांची संख्या, उपलब्ध तज्ज्ञ डॉक्टर, थेट दिशा व अंतर.'
              : language === 'hi'
              ? 'महाराष्ट्र के सभी सरकारी स्वास्थ्य केंद्रों की 24x7 आपातकालीन उपलब्धता, बिस्तरों की संख्या, विशेषज्ञ डॉक्टर और दूरी।'
              : 'Real-time interactive OpenStreetMap GIS tracking of emergency doctors, vacant beds, anti-snake venom stock, and distances.'}
          </p>
      
        </div>
      
      </div>

      {/* Data Source Transparency Banner */}

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'mr'
                  ? 'तालुका, गाव किंवा केंद्राचे नाव शोधा...'
                  : language === 'hi'
                  ? 'तहसील, गांव या अस्पताल खोजें...'
                  : 'Search taluka, village, or hospital name...'
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
      
          </div>

          {/* District Selector */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL'
                    ? language === 'mr'
                      ? 'सर्व जिल्हे (All Districts)'
                      : language === 'hi'
                      ? 'सभी जिले (All Districts)'
                      : 'All Districts'
                    : language === 'mr'
                    ? `${d} जिल्हा`
                    : language === 'hi'
                    ? `${d} जिला`
                    : `${d} District`}
                </option>
              ))}
            </select>
      
          </div>

          {/* Facility Type Selector */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer"
            >
              <option value="ALL">
                {language === 'mr' ? 'सर्व प्रकार (All Types)' : language === 'hi' ? 'सभी प्रकार (All Types)' : 'All Types'}
              </option>
              {facilityTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
      
          </div>
      
        </div>

        {/* Checkbox Quick Filters & View Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs font-semibold">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={onlyEmergency}
                onChange={(e) => setOnlyEmergency(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>
                {language === 'mr'
                  ? '२४x७ आपत्कालीन सेवा उपलब्ध'
                  : language === 'hi'
                  ? '24x7 आपातकालीन सेवा उपलब्ध'
                  : '24x7 Emergency Available'}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={onlyFreeMeds}
                onChange={(e) => setOnlyFreeMeds(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>
                {language === 'mr'
                  ? 'मोफत औषध काउंटर'
                  : language === 'hi'
                  ? 'मुफ्त औषधि काउंटर'
                  : 'Free Medicines Counter'}
              </span>
            </label>
      
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? 'नकाशा (Map)' : language === 'hi' ? 'मानचित्र (Map)' : 'Interactive Map'}</span>
            </button>

            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? 'कार्ड यादी (Cards)' : language === 'hi' ? 'कार्ड सूची (Cards)' : 'Card View'}</span>
            </button>
      
          </div>
      
        </div>
      
      </div>

      {/* Empty State */}
      {filteredFacilities.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {language === 'mr' ? 'प्रमाणित माहिती सध्या उपलब्ध नाही.' : language === 'hi' ? 'सत्यापित जानकारी वर्तमान में अनुपलब्ध है।' : 'Verified information is currently unavailable.'}
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            {language === 'mr' ? 'तुमच्या जवळील प्रमाणित आरोग्य केंद्रांची माहिती लवकरच उपलब्ध होईल.' : language === 'hi' ? 'आपके निकट सत्यापित स्वास्थ्य केंद्रों की जानकारी शीघ्र ही उपलब्ध होगी।' : 'Verified healthcare facilities near you will be available soon.'}
          </p>
      
        </div>
      )}

      {/* Interactive Map Mode */}
      {viewMode === 'map' && filteredFacilities.length > 0 && (
        <div className="space-y-4">
          <HealthcareMap
            facilities={filteredFacilities}
            selectedFacilityId={selectedFacilityId}
            onSelectFacility={(fac) => setSelectedFacilityId(fac.id)}
            userCoords={userCoords}
            onUserCoordsChange={(coords) => setUserCoords(coords)}
            height="560px"
          />

          {/* Quick Facility Strip below map for fast selection */}
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 px-1">
              <span>
                {language === 'mr'
                  ? 'नकाशावरील केंद्रे (द्रुत निवड):'
                  : language === 'hi'
                  ? 'मानचित्र पर केंद्र (त्वरित चयन):'
                  : 'Facilities on Map (Quick Focus):'}
              </span>
              <span>
                {formatNumber(filteredFacilities.length)}{' '}
                {language === 'mr' ? 'केंद्रे उपलब्ध' : language === 'hi' ? 'केंद्र उपलब्ध' : 'locations'}
              </span>
      
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredFacilities.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setSelectedFacilityId(f.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left flex items-start justify-between gap-3 ${
                    selectedFacilityId === f.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                        {f.type}
                      </span>
                      {f.is24x7Emergency && (
                        <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400">
                          ⚡ 24x7
                        </span>
                      )}
      
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {language === 'mr' ? f.nameMr : f.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">{f.taluka}, {f.district}</p>
      
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <span className="text-xs font-black text-emerald-600">
                      {formatDistance(f.distanceKm)}
                    </span>
                    <div className="text-[10px] text-slate-500">
                      🛏️ {formatNumber(f.bedsAvailable)} {language === 'mr' ? 'खाटा' : language === 'hi' ? 'बिस्तर' : 'beds'}
      
                    </div>
      
                  </div>
      
                </div>
              ))}
      
            </div>
      
          </div>
      
        </div>
      )}

      {/* Cards View Mode */}
      {viewMode === 'cards' && filteredFacilities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {filteredFacilities.map((facility) => (
            <div
              key={facility.id}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 font-bold text-[10px] px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-700">
                    {facility.type}
                  </span>
                  <span className="text-xs font-black text-emerald-600 font-mono">
                    📍 {formatDistance(facility.distanceKm)}
                  </span>
      
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {language === 'mr' ? facility.nameMr : facility.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{facility.villageOrCity}, {facility.taluka}, {facility.district}</span>
                  </p>
      
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-700">
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-500">
                      {language === 'mr' ? 'उपलब्ध खाटा' : language === 'hi' ? 'उपलब्ध बिस्तर' : 'Available Beds'}
      
                    </div>
                    <div className="font-black text-slate-800 dark:text-slate-200">
                      {formatNumber(facility.bedsAvailable)} / {formatNumber(facility.bedsTotal)}
      
                    </div>
      
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-500">
                      {language === 'mr' ? '२४x७ आपत्कालीन' : language === 'hi' ? '24x7 आपातकाल' : '24x7 Emergency'}
      
                    </div>
                    <div className="font-black text-emerald-600">
                      {facility.is24x7Emergency
                        ? language === 'mr'
                          ? 'उपलब्ध (Active)'
                          : language === 'hi'
                          ? 'उपलब्ध (Active)'
                          : 'Available'
                        : language === 'mr'
                        ? 'नाही'
                        : language === 'hi'
                        ? 'नहीं'
                        : 'No'}
      
                    </div>
      
                  </div>
      
                </div>

                {facility.specialistsAvailable && facility.specialistsAvailable.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">
                      {language === 'mr' ? 'उपलब्ध तज्ज्ञ डॉक्टर:' : language === 'hi' ? 'उपलब्ध विशेषज्ञ डॉक्टर:' : 'Specialists Available:'}
      
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {facility.specialistsAvailable.map((s, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-medium px-2 py-0.5 rounded-md"
                        >
                          {s}
                        </span>
                      ))}
      
                    </div>
      
                  </div>
                )}
      
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
                <button
                  onClick={() => handleFacilitySelectFromList(facility)}
                  className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{language === 'mr' ? 'नकाशावर पहा' : language === 'hi' ? 'मानचित्र पर देखें' : 'View on Map'}</span>
                </button>
                <button
                  onClick={() => {
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`, '_blank');
                  }}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{language === 'mr' ? 'दिशा मिळवा' : language === 'hi' ? 'दिशा प्राप्त करें' : 'Get Directions'}</span>
                </button>
      
              </div>
      
            </div>
          ))}
      
        </div>
      )}
      
      <FacilityDetailsModal facility={selectedFacility} onClose={() => setSelectedFacilityId(null)} />
    </div>
  );
};
