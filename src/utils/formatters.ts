import { Language } from '../types';

const DEVANAGARI_DIGITS: Record<string, string> = {
  '0': '०',
  '1': '१',
  '2': '२',
  '3': '३',
  '4': '४',
  '5': '५',
  '6': '६',
  '7': '७',
  '8': '८',
  '9': '९',
};

export const toDevanagariNumerals = (val: string | number): string => {
  return String(val).replace(/[0-9]/g, (digit) => DEVANAGARI_DIGITS[digit] || digit);
};

export const getLocaleCode = (lang: Language): string => {
  switch (lang) {
    case 'mr':
      return 'mr-IN';
    case 'hi':
      return 'hi-IN';
    case 'en':
    default:
      return 'en-IN';
  }
};

/**
 * Format a number according to the selected language locale.
 */
export const formatNumber = (num: number | string, lang: Language, useDevanagariDigits = true): string => {
  const numericVal = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(numericVal)) return String(num);

  if (lang === 'en') {
    return numericVal.toLocaleString('en-IN');
  }

  const formatted = numericVal.toLocaleString(getLocaleCode(lang));
  if (useDevanagariDigits && (lang === 'mr' || lang === 'hi')) {
    return toDevanagariNumerals(formatted);
  }
  return formatted;
};

/**
 * Format a currency amount according to the selected language.
 */
export const formatCurrency = (amount: number | string, lang: Language): string => {
  const numericVal = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericVal)) return String(amount);

  if (lang === 'mr') {
    return `₹${toDevanagariNumerals(numericVal.toLocaleString('en-IN'))}`;
  }
  if (lang === 'hi') {
    return `₹${numericVal.toLocaleString('hi-IN')}`;
  }
  return `₹${numericVal.toLocaleString('en-IN')}`;
};

/**
 * Format a distance in kilometers with localized unit.
 */
export const formatDistance = (km: number | string, lang: Language): string => {
  const numericVal = typeof km === 'string' ? parseFloat(km) : km;
  if (isNaN(numericVal)) return String(km);

  const rounded = numericVal < 10 ? numericVal.toFixed(1) : Math.round(numericVal).toString();

  if (lang === 'mr') {
    return `${toDevanagariNumerals(rounded)} किमी अंतरावर`;
  }
  if (lang === 'hi') {
    return `${rounded} किमी दूर`;
  }
  return `${rounded} km away`;
};

/**
 * Format a Date string or object to localized format.
 */
export const formatDate = (
  dateInput: string | number | Date | undefined,
  lang: Language,
  formatStyle: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string => {
  if (!dateInput) return '';

  let date: Date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'number') {
    date = new Date(dateInput);
  } else {
    // Handle standard YYYY-MM-DD or ISO strings
    date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      // If it's a pre-formatted string, try to parse
      return dateInput;
    }
  }

  const locale = getLocaleCode(lang);
  let options: Intl.DateTimeFormatOptions;

  switch (formatStyle) {
    case 'short':
      options = { day: 'numeric', month: 'numeric', year: 'numeric' };
      break;
    case 'long':
      options = { day: 'numeric', month: 'long', year: 'numeric' };
      break;
    case 'full':
      options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      break;
    case 'medium':
    default:
      options = { day: 'numeric', month: 'short', year: 'numeric' };
      break;
  }

  try {
    const formatted = new Intl.DateTimeFormat(locale, options).format(date);
    if (lang === 'mr') {
      return toDevanagariNumerals(formatted);
    }
    return formatted;
  } catch {
    return date.toLocaleDateString();
  }
};

/**
 * Localize time string or Date object.
 * e.g. "11:30 AM" -> "सकाळी ११:३०" (Marathi) / "सुबह 11:30" (Hindi)
 */
export const formatTime = (timeInput: string | Date | undefined, lang: Language): string => {
  if (!timeInput) return '';

  if (timeInput instanceof Date) {
    const hours = timeInput.getHours();
    const minutes = timeInput.getMinutes().toString().padStart(2, '0');
    const isAm = hours < 12;
    const displayHour = hours % 12 || 12;
    const timeStr = `${displayHour}:${minutes}`;

    if (lang === 'mr') {
      const period = isAm ? 'सकाळी' : (hours < 16 ? 'दुपारी' : (hours < 20 ? 'संध्याकाळी' : 'रात्री'));
      return `${period} ${toDevanagariNumerals(timeStr)}`;
    }
    if (lang === 'hi') {
      const period = isAm ? 'सुबह' : (hours < 16 ? 'दोपहर' : (hours < 20 ? 'शाम' : 'रात'));
      return `${period} ${timeStr}`;
    }
    return `${timeStr} ${isAm ? 'AM' : 'PM'}`;
  }

  // If timeInput is string like "11:30 AM" or "14:30" or "09:00 - 17:00"
  const match = timeInput.match(/(\d{1,2})[:.](\d{2})\s*(AM|PM|am|pm)?/i);
  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = match[2];
    const modifier = match[3]?.toUpperCase();

    let isAm = true;
    if (modifier === 'PM' && hour < 12) hour += 12;
    if (modifier === 'AM' && hour === 12) hour = 0;
    if (!modifier && hour >= 12) isAm = false;
    else if (modifier) isAm = modifier === 'AM';

    const displayHour = hour % 12 || 12;
    const timeStr = `${displayHour}:${minute}`;

    if (lang === 'mr') {
      const period = isAm ? 'सकाळी' : (hour < 16 ? 'दुपारी' : (hour < 20 ? 'संध्याकाळी' : 'रात्री'));
      return `${period} ${toDevanagariNumerals(timeStr)}`;
    }
    if (lang === 'hi') {
      const period = isAm ? 'सुबह' : (hour < 16 ? 'दोपहर' : (hour < 20 ? 'शाम' : 'रात'));
      return `${period} ${timeStr}`;
    }
    return `${timeStr} ${isAm ? 'AM' : 'PM'}`;
  }

  return timeInput;
};

/**
 * Format Date and Time combined e.g. "12 May, 11:30 AM" -> "१२ मे, सकाळी ११:३०"
 */
export const formatDateTime = (
  dateInput: string | number | Date | undefined,
  lang: Language
): string => {
  if (!dateInput) return '';

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) {
    return String(dateInput);
  }

  const formattedDate = formatDate(date, lang, 'medium');
  const formattedTime = formatTime(date, lang);

  return `${formattedDate}, ${formattedTime}`;
};

/**
 * Format relative time (e.g. "5 minutes ago" -> "५ मिनिटांपूर्वी")
 */
export const formatRelativeTime = (
  dateInput: string | number | Date | undefined,
  lang: Language
): string => {
  if (!dateInput) return '';

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    if (lang === 'mr') return 'आत्ताच';
    if (lang === 'hi') return 'अभी-अभी';
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    if (lang === 'mr') return `${toDevanagariNumerals(diffInMinutes)} मिनिटांपूर्वी`;
    if (lang === 'hi') return `${diffInMinutes} मिनट पहले`;
    return `${diffInMinutes} min ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    if (lang === 'mr') return `${toDevanagariNumerals(diffInHours)} तासांपूर्वी`;
    if (lang === 'hi') return `${diffInHours} घंटे पहले`;
    return `${diffInHours} hr ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    if (lang === 'mr') return `${toDevanagariNumerals(diffInDays)} दिवसांपूर्वी`;
    if (lang === 'hi') return `${diffInDays} दिन पहले`;
    return `${diffInDays} days ago`;
  }

  return formatDate(date, lang, 'short');
};

/**
 * Localize facility type label (e.g., PHC, CHC, DH, Sub-Centre)
 */
export const formatFacilityType = (type: string, lang: Language): string => {
  const normalized = (type || '').trim().toLowerCase();
  
  if (normalized.includes('phc') || normalized.includes('primary')) {
    if (lang === 'mr') return 'प्राथमिक आरोग्य केंद्र (PHC)';
    if (lang === 'hi') return 'प्राथमिक स्वास्थ्य केंद्र (PHC)';
    return 'Primary Health Centre (PHC)';
  }
  if (normalized.includes('chc') || normalized.includes('community') || normalized.includes('rural hospital')) {
    if (lang === 'mr') return 'सामुदायिक आरोग्य केंद्र / ग्रामीण रुग्णालय (CHC)';
    if (lang === 'hi') return 'सामुदायिक स्वास्थ्य केंद्र / ग्रामीण अस्पताल (CHC)';
    return 'Community Health Centre (CHC)';
  }
  if (normalized.includes('dh') || normalized.includes('district')) {
    if (lang === 'mr') return 'जिल्हा रुग्णालय (District Hospital)';
    if (lang === 'hi') return 'जिला अस्पताल (District Hospital)';
    return 'District Hospital (DH)';
  }
  if (normalized.includes('sub') || normalized.includes('hwc') || normalized.includes('arogyavardhini')) {
    if (lang === 'mr') return 'उप-आरोग्य केंद्र / आरोग्यवर्धिनी (Sub-Centre)';
    if (lang === 'hi') return 'उप स्वास्थ्य केंद्र / आरोग्यवर्धिनी (Sub-Centre)';
    return 'Health Sub-Centre (Arogyavardhini)';
  }
  
  return type;
};

/**
 * Localize doctor name / title
 */
export const formatDoctorName = (name: string, lang: Language): string => {
  if (!name) return '';
  const cleanName = name.replace(/^(Dr\.|Doctor|डॉ\.|डॉक्टर)\s*/i, '');
  if (lang === 'mr' || lang === 'hi') {
    return `डॉ. ${cleanName}`;
  }
  return `Dr. ${cleanName}`;
};

/**
 * Localize doctor status (e.g., on-duty, busy, off-duty)
 */
export const formatDoctorStatus = (status: string, lang: Language): { label: string; color: string } => {
  const normalized = (status || '').toLowerCase();
  if (normalized === 'on-duty' || normalized === 'available' || normalized === 'active') {
    return {
      label: lang === 'mr' ? 'कर्तव्यावर उपस्थित (On Duty)' : lang === 'hi' ? 'ड्यूटी पर उपस्थित' : 'On Duty & Active',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
    };
  }
  if (normalized === 'busy' || normalized === 'in-consultation') {
    return {
      label: lang === 'mr' ? 'तपासणीत व्यस्त (In Consultation)' : lang === 'hi' ? 'जांच में व्यस्त' : 'In Consultation',
      color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
    };
  }
  return {
    label: lang === 'mr' ? 'कामावरून सुटीवर (Off Duty)' : lang === 'hi' ? 'ड्यूटी से बाहर' : 'Off Duty',
    color: 'bg-stone-100 text-stone-700 border-stone-300 dark:bg-stone-800 dark:text-stone-300',
  };
};

/**
 * Localize appointment status
 */
export const formatAppointmentStatus = (status: string, lang: Language): { label: string; color: string } => {
  const normalized = (status || '').toLowerCase();
  if (normalized === 'confirmed' || normalized === 'booked') {
    return {
      label: lang === 'mr' ? 'पुष्टी झाली (Confirmed)' : lang === 'hi' ? 'पुष्टि हुई (Confirmed)' : 'Confirmed',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
    };
  }
  if (normalized === 'in-progress' || normalized === 'in_progress' || normalized === 'waiting') {
    return {
      label: lang === 'mr' ? 'तपासणी सुरू (In Progress)' : lang === 'hi' ? 'प्रगति पर' : 'In Progress',
      color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
    };
  }
  if (normalized === 'completed' || normalized === 'done') {
    return {
      label: lang === 'mr' ? 'तपासणी पूर्ण (Completed)' : lang === 'hi' ? 'पूर्ण (Completed)' : 'Completed',
      color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300',
    };
  }
  if (normalized === 'cancelled' || normalized === 'rejected') {
    return {
      label: lang === 'mr' ? 'रद्द (Cancelled)' : lang === 'hi' ? 'रद्द (Cancelled)' : 'Cancelled',
      color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300',
    };
  }
  return {
    label: status,
    color: 'bg-stone-100 text-stone-700 border-stone-300 dark:bg-stone-800 dark:text-stone-300',
  };
};

/**
 * Localize medicine stock status
 */
export const formatStockStatus = (status: string, lang: Language): { label: string; color: string } => {
  const normalized = (status || '').toLowerCase();
  if (normalized === 'in_stock' || normalized === 'in stock' || normalized === 'available') {
    return {
      label: lang === 'mr' ? 'साठा उपलब्ध (In Stock)' : lang === 'hi' ? 'स्टॉक उपलब्ध (In Stock)' : 'In Stock',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    };
  }
  if (normalized === 'low_stock' || normalized === 'low stock' || normalized === 'limited') {
    return {
      label: lang === 'mr' ? 'कमी साठा (Low Stock)' : lang === 'hi' ? 'सीमित स्टॉक (Low Stock)' : 'Low Stock',
      color: 'bg-amber-100 text-amber-800 border-amber-300',
    };
  }
  return {
    label: lang === 'mr' ? 'साठा संपला (Out of Stock)' : lang === 'hi' ? 'स्टॉक समाप्त' : 'Out of Stock',
    color: 'bg-rose-100 text-rose-800 border-rose-300',
  };
};

/**
 * Localize user roles
 */
export const formatUserRole = (role: string, lang: Language): string => {
  const normalized = (role || '').toLowerCase();
  if (normalized === 'patient' || normalized === 'citizen') {
    return lang === 'mr' ? 'नागरिक / रुग्ण' : lang === 'hi' ? 'नागरिक / रोगी' : 'Citizen / Patient';
  }
  if (normalized === 'doctor' || normalized === 'medical_officer') {
    return lang === 'mr' ? 'वैद्यकीय अधिकारी (Doctor)' : lang === 'hi' ? 'चिकित्सा अधिकारी (Doctor)' : 'Medical Officer';
  }
  if (normalized === 'admin' || normalized === 'health_admin') {
    return lang === 'mr' ? 'सार्वजनिक आरोग्य प्रशासक' : lang === 'hi' ? 'सार्वजनिक स्वास्थ्य प्रशासक' : 'Health Administrator';
  }
  return role;
};
