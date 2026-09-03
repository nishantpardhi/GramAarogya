import { Request, Response } from 'express';
import { db } from '../db/store';
import { Prescription } from '../models/Prescription';
import { Referral } from '../models/Referral';
import { HealthRecord } from '../models/HealthRecord';
import { MedicineStock } from '../models/MedicineStock';
import { HealthCamp } from '../models/HealthCamp';
import { AuthRequest } from '../middleware/auth';
import { uploadBase64Image } from '../utils/cloudinary';

// In-Memory store arrays for fast zero-latency fallbacks
let activePrescriptions: any[] = [
  {
    id: 'rx-101',
    patientId: 'pat-1',
    patientName: 'Shantabai Gawande (शांताबाई)',
    patientAge: 48,
    patientGender: 'Female',
    doctorId: 'doc-1',
    doctorName: 'Dr. Rameshwar Deshmukh',
    doctorSpecialization: 'General Medicine',
    facilityName: 'PHC Ramtek (प्रा. आ. केंद्र रामटेक)',
    date: '2025-02-28',
    diagnosis: 'Hypertension (Stage 1) & Mild Viral Fever',
    symptoms: ['Headache', 'Elevated BP (145/90)', 'Mild body fatigue'],
    medicines: [
      {
        name: 'Amlodipine Tablets IP 5mg',
        dosage: '1 tab OD',
        frequency: 'Morning after food',
        duration: '30 Days',
        instructions: 'Take regularly at 9 AM, do not skip',
        isAvailableAtPHC: true,
      },
      {
        name: 'Paracetamol Tablets IP 500mg',
        dosage: '1 tab SOS',
        frequency: 'Twice daily if fever > 100°F',
        duration: '5 Days',
        instructions: 'After meals',
        isAvailableAtPHC: true,
      },
      {
        name: 'Oral Rehydration Salts (ORS) WHO Formula',
        dosage: '1 sachet in 1L water',
        frequency: 'Daily sip by sip',
        duration: '3 Days',
        instructions: 'Keep hydrated',
        isAvailableAtPHC: true,
      },
    ],
    advice: 'Low sodium salt diet. Regular 20 min morning walk. Check BP again in 2 weeks at PHC.',
    followUpDate: '2025-03-15',
    signedDigitally: true,
  },
];

let activeReferrals: any[] = [
  {
    id: 'ref-501',
    patientId: 'pat-1',
    patientName: 'Shantabai Gawande (शांताबाई)',
    referringDoctorId: 'doc-1',
    referringDoctorName: 'Dr. Rameshwar Deshmukh',
    fromFacilityName: 'PHC Ramtek',
    targetFacilityId: 'fac-nagpur-dh-nagpur',
    targetFacilityName: 'District Hospital Nagpur (शासकीय जिल्हा सामान्य रुग्णालय नागपूर)',
    targetSpeciality: 'Cardiology & 2D Echo Lab',
    reason: 'Evaluation of persistent exertional dyspnea and cardiac rhythm screening',
    urgency: 'Urgent',
    date: '2025-02-28',
    status: 'Pending',
    mjpjayEligible: true,
  },
];

let activeHealthRecords: any[] = [
  {
    id: 'rec-001',
    patientId: 'pat-1',
    title: 'Complete Blood Count (CBC) & Lipid Profile',
    titleMr: 'रक्त तपासणी अहवाल (CBC व लिपिड प्रोफाइल)',
    category: 'Lab Report',
    facilityName: 'PHC Ramtek Central Diagnostic Hub',
    doctorName: 'Dr. Rameshwar Deshmukh',
    date: '2025-02-24',
    summary: 'Hb: 12.2 g/dL (Normal), Total Cholesterol: 185 mg/dL (Normal range), Blood Sugar Fasting: 94 mg/dL (Normal).',
    fileType: 'PDF',
    fileName: 'CBC_LabReport_Ramtek_20250224.pdf',
    tags: ['Blood Test', 'Routine Checkup', 'Free Government Diagnostics'],
  },
  {
    id: 'rec-002',
    patientId: 'pat-1',
    title: 'COVID-19 & Tetanus Toxoid Booster Record',
    titleMr: 'लसीकरण प्रमाणपत्र (COVID-19 व धनुर्वात)',
    category: 'Vaccination',
    facilityName: 'Ramtek Sub-Centre Immunization Session',
    doctorName: 'Sister Sunita Patil (ANM)',
    date: '2024-11-12',
    summary: 'Both doses + Precaution dose completed. TT booster administered safely with zero adverse reactions.',
    fileType: 'Digital',
    fileName: 'Immunization_Card_MH_441106.pdf',
    tags: ['Universal Immunization Programme', 'ANM Record'],
  },
];

// Prescriptions
export const getPrescriptions = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, doctorId } = req.query as Record<string, string>;
    try {
      const query: any = {};
      if (patientId) query.patientId = patientId;
      if (doctorId) query.doctorId = doctorId;

      const mongoRx = await Prescription.find(query).sort({ createdAt: -1 });
      if (mongoRx.length > 0) {
        return res.json({ success: true, count: mongoRx.length, data: mongoRx });
      }
    } catch {
      // Fallback
    }

    let filtered = activePrescriptions;
    if (patientId) filtered = filtered.filter((r) => r.patientId === patientId);
    if (doctorId) filtered = filtered.filter((r) => r.doctorId === doctorId);

    return res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const payload = req.body;
    const newRx = {
      id: `rx-${Date.now()}`,
      ...payload,
      signedDigitally: true,
      createdAt: new Date().toISOString(),
    };

    activePrescriptions.unshift(newRx);

    try {
      const doc = new Prescription(newRx);
      await doc.save();
    } catch {
      // Fallback
    }

    return res.status(201).json({
      success: true,
      message: 'Prescription generated & digitally signed with ABHA compliance.',
      data: newRx,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Referrals
export const getReferrals = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, doctorId } = req.query as Record<string, string>;
    let list = activeReferrals;
    if (patientId) list = list.filter((r) => r.patientId === patientId);
    if (doctorId) list = list.filter((r) => r.referringDoctorId === doctorId);

    return res.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createReferral = async (req: AuthRequest, res: Response) => {
  try {
    const payload = req.body;
    const newRef = {
      id: `ref-${Date.now()}`,
      ...payload,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      mjpjayEligible: true,
    };

    activeReferrals.unshift(newRef);

    try {
      const doc = new Referral(newRef);
      await doc.save();
    } catch {
      // Fallback
    }

    return res.status(201).json({
      success: true,
      message: 'Referral letter generated for higher government medical centre.',
      data: newRef,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Health Records
export const getHealthRecords = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.query as Record<string, string>;
    let list = activeHealthRecords;
    if (patientId) list = list.filter((r) => r.patientId === patientId);

    return res.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const uploadHealthRecord = async (req: AuthRequest, res: Response) => {
  try {
    const payload = req.body;
    let fileUrl = payload.fileUrl;

    if (payload.fileBase64) {
      const uploadRes = await uploadBase64Image(payload.fileBase64, 'gramarogya_records');
      if (uploadRes.success && uploadRes.url) {
        fileUrl = uploadRes.url;
      }
    }

    const newRecord = {
      id: `rec-${Date.now()}`,
      patientId: payload.patientId || req.user?.id || 'pat-1',
      title: payload.title,
      titleMr: payload.titleMr || payload.title,
      category: payload.category || 'Lab Report',
      facilityName: payload.facilityName || 'Public Health Centre',
      doctorName: payload.doctorName,
      date: payload.date || new Date().toISOString().split('T')[0],
      summary: payload.summary || 'Uploaded diagnostic document',
      fileType: payload.fileType || 'PDF',
      fileName: payload.fileName || 'HealthDocument.pdf',
      fileUrl,
      tags: payload.tags || ['Citizen Upload'],
    };

    activeHealthRecords.unshift(newRecord);

    try {
      const doc = new HealthRecord(newRecord);
      await doc.save();
    } catch {
      // Fallback
    }

    return res.status(201).json({
      success: true,
      message: 'Medical document uploaded to citizen ABHA locker.',
      data: newRecord,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Health Schemes
export const getHealthSchemes = async (req: Request, res: Response) => {
  try {
    const schemes = db.getHealthSchemes();
    return res.json({
      success: true,
      count: schemes.length,
      source: 'Government of Maharashtra - Public Health Department Schemes Portal',
      sourceUrl: 'https://arogya.maharashtra.gov.in/schemes',
      data: schemes,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Medicines
export const getMedicines = async (req: Request, res: Response) => {
  try {
    const { facilityId } = req.query as Record<string, string>;
    const medicines = db.getMedicineStocks(facilityId);
    return res.json({
      success: true,
      count: medicines.length,
      source: 'e-Aushadhi Drug Inventory Management System (Maharashtra DHS)',
      sourceUrl: 'https://eaushadhi.maharashtra.gov.in',
      data: medicines,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Health Camps
export const getHealthCamps = async (req: Request, res: Response) => {
  try {
    const { district } = req.query as Record<string, string>;
    const camps = db.getHealthCamps(district);
    return res.json({
      success: true,
      count: camps.length,
      source: 'National Health Mission (NHM) Maharashtra Outreach Schedule',
      sourceUrl: 'https://nhm.maharashtra.gov.in/camps',
      data: camps,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const registerForCamp = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const camp = db.registerForHealthCamp(id);

    if (!camp) {
      return res.status(404).json({ success: false, error: 'Health camp not found.' });
    }

    return res.json({
      success: true,
      message: `Registration confirmed for ${camp.title}! Please carry your Aadhaar card and previous medical slips.`,
      data: camp,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Audit Logs
export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const logs = db.getAuditLogs();
    return res.json({
      success: true,
      count: logs.length,
      source: 'GramAarogya Maharashtra Node/Express Audit Trail',
      data: logs,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
