import { Request, Response } from 'express';
import { EmergencyRequest } from '../models/EmergencyRequest';
import { Ambulance } from '../models/Ambulance';
import { emitEmergencyUpdate, emitNotification } from '../socket';
import { AuthRequest } from '../middleware/auth';

// Emergency requests in-memory store for instant zero-latency fallbacks
const activeEmergencies = new Map<string, any>();

// Seed default active emergency for immediate live demo viewing
const seedSosId = 'sos-live-108';
activeEmergencies.set(seedSosId, {
  id: seedSosId,
  patientId: 'pat-1',
  patientName: 'Shantabai Gawande (शांताबाई)',
  contactNumber: '+91 98221 55667',
  emergencyType: 'Cardiac',
  locationAddress: 'Near Hanuman Temple, Ramtek Village, Nagpur',
  village: 'Ramtek',
  district: 'Nagpur',
  lat: 21.3966,
  lng: 79.3274,
  status: 'AMBULANCE_ASSIGNED',
  ambulanceId: 'amb-108-1',
  vehicleNumber: 'MH-40-AZ-1081',
  driverId: 'drv-1',
  driverName: 'Sanjay Shinde (संजय शिंदे)',
  driverMobile: '+91 98221 08108',
  etaMinutes: 8,
  assignedHospitalId: 'fac-nagpur-phc-ramtek',
  assignedHospital: 'Sub-District Hospital Ramtek',
  assignedHospitalNameMr: 'उपजिल्हा रुग्णालय रामटेक',
  requiredFacilityCapability: '24x7 Emergency, Cardiac Stabilisation & ICU Ready',
  dispatchNotes: 'Driver informed. ETA 8 mins with oxygen cylinder ready.',
  hospitalNotified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const triggerEmergencySOS = async (req: Request, res: Response) => {
  try {
    const {
      patientId = 'pat-guest',
      patientName = 'Emergency Patient (तातडीचा रुग्ण)',
      contactNumber = '+91 108',
      emergencyType = 'Critical SOS',
      locationAddress = 'Current GPS Location, Maharashtra',
      village = 'Ramtek',
      district = 'Nagpur',
      lat = 21.3966,
      lng = 79.3274,
      notes,
    } = req.body;

    const sosId = `sos-${Date.now()}`;
    const newEmergency = {
      id: sosId,
      patientId,
      patientName,
      contactNumber,
      emergencyType,
      locationAddress,
      village,
      district,
      lat: Number(lat),
      lng: Number(lng),
      status: 'AMBULANCE_ASSIGNED',
      ambulanceId: 'amb-108-1',
      vehicleNumber: 'MH-40-AZ-1081',
      driverId: 'drv-1',
      driverName: 'Sanjay Shinde (संजय शिंदे)',
      driverMobile: '+91 98221 08108',
      etaMinutes: 11,
      assignedHospitalId: 'fac-nagpur-phc-ramtek',
      assignedHospital: 'Sub-District Hospital Ramtek',
      assignedHospitalNameMr: 'उपजिल्हा रुग्णालय रामटेक',
      requiredFacilityCapability: '24x7 Emergency Trauma & Resuscitation Center',
      dispatchNotes: notes || '108 Maharashtra Emergency Services unit dispatched instantly.',
      hospitalNotified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    activeEmergencies.set(sosId, newEmergency);

    try {
      const mongoRecord = new EmergencyRequest(newEmergency);
      await mongoRecord.save();
    } catch {
      // In-memory fallback
    }

    // Real-time broadcast
    emitEmergencyUpdate(sosId, newEmergency);

    return res.status(201).json({
      success: true,
      message: '🚨 108 Emergency SOS Dispatched! Ambulance MH-40-AZ-1081 is en-route.',
      data: newEmergency,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getEmergencyStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let emergency = activeEmergencies.get(id);

    if (!emergency) {
      try {
        const doc = await EmergencyRequest.findById(id);
        if (doc) emergency = doc.toJSON();
      } catch {
        // Ignore
      }
    }

    if (!emergency) {
      emergency = activeEmergencies.get(seedSosId);
    }

    return res.json({
      success: true,
      data: emergency,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateEmergencyStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, etaMinutes, dispatchNotes, assignedHospital } = req.body;

    let emergency = activeEmergencies.get(id);
    if (!emergency) {
      emergency = activeEmergencies.get(seedSosId);
    }

    if (emergency) {
      if (status) emergency.status = status;
      if (typeof etaMinutes === 'number') emergency.etaMinutes = etaMinutes;
      if (dispatchNotes) emergency.dispatchNotes = dispatchNotes;
      if (assignedHospital) emergency.assignedHospital = assignedHospital;
      emergency.updatedAt = new Date().toISOString();

      activeEmergencies.set(id, emergency);

      try {
        await EmergencyRequest.findByIdAndUpdate(id, emergency);
      } catch {
        // Ignore
      }

      emitEmergencyUpdate(id, emergency);

      return res.json({
        success: true,
        message: `Emergency SOS status updated to '${status}'.`,
        data: emergency,
      });
    }

    return res.status(404).json({
      success: false,
      error: 'Emergency request not found.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllEmergencies = async (req: AuthRequest, res: Response) => {
  try {
    const list = Array.from(activeEmergencies.values());
    return res.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
