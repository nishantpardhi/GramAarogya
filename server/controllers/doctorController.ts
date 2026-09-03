import { Request, Response } from 'express';
import { Doctor } from '../models/Doctor';
import { db } from '../db/store';
import { providerManager } from '../providers';
import { emitDoctorAvailabilityUpdate } from '../socket';
import { AuthRequest } from '../middleware/auth';

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const { facilityId, specialization, includePending } = req.query as Record<string, string>;

    try {
      const query: any = {};
      if (facilityId) query.facilityId = facilityId;
      if (specialization) query.specialization = { $regex: new RegExp(specialization, 'i') };
      if (!includePending) query.verificationStatus = 'verified';

      const mongoDoctors = await Doctor.find(query);
      if (mongoDoctors.length > 0) {
        return res.json({
          success: true,
          count: mongoDoctors.length,
          source: 'MongoDB Atlas - Maharashtra Medical Council (MMC) Registry',
          data: mongoDoctors,
        });
      }
    } catch {
      // Fallback
    }

    const provider = providerManager.getActiveProvider();
    const result = await provider.getDoctors({
      facilityId,
      specialization,
      includePending: includePending === 'true',
    });

    return res.json({
      success: true,
      count: result.data.length,
      source: result.source,
      lastUpdated: result.lastUpdated,
      isDemo: result.isDemo,
      provider: provider.name,
      data: result.data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch doctors',
      data: [],
    });
  }
};

export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const provider = providerManager.getActiveProvider();
    const doctor = await provider.getDoctorById(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: `Doctor with ID '${id}' not found.`,
      });
    }

    return res.json({
      success: true,
      data: doctor,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getDoctorAvailability = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const avail = db.getDoctorAvailability(doctorId);

    if (!avail) {
      return res.status(404).json({
        success: false,
        error: `Availability data for doctor '${doctorId}' not found.`,
      });
    }

    return res.json({
      success: true,
      data: avail,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateDoctorAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId } = req.params;
    const { status, activeShift, notes, updatedBy, consultationType, opdTimings } = req.body;

    const validStatuses = ['available', 'with_patient', 'busy', 'on_break', 'off_duty'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const updated = db.updateDoctorAvailability(doctorId, {
      status,
      activeShift: opdTimings || activeShift,
      notes,
      consultationType,
      opdTimings,
      updatedBy: updatedBy || req.user?.name || 'Doctor',
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Doctor with ID '${doctorId}' not found.`,
      });
    }

    // Keep memory doctor object synced as well
    const docMem = db.doctors.find((d) => d.id === doctorId);
    if (docMem) {
      docMem.isAvailableToday = status === 'available' || status === 'with_patient';
      docMem.telemedicineAvailable = status === 'available' && consultationType !== 'In-Person (OPD)';
      if (opdTimings) docMem.opdTimings = opdTimings;
      if (consultationType) docMem.consultationType = consultationType;
    }

    // Update in MongoDB if available
    try {
      await Doctor.findOneAndUpdate(
        { doctorId },
        {
          status,
          statusText: updated.statusText,
          statusTextMr: updated.statusTextMr,
          ...(opdTimings && { opdTimings }),
          ...(consultationType && { consultationType }),
          isAvailableToday: status === 'available' || status === 'with_patient',
          telemedicineAvailable: status === 'available' && consultationType !== 'In-Person (OPD)',
        }
      );
    } catch {
      // Ignore
    }

    // Real-time broadcast via Socket.IO
    emitDoctorAvailabilityUpdate(doctorId, updated);

    return res.json({
      success: true,
      message: `Doctor status updated to '${status}'.`,
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const findAlternativeDoctors = async (req: Request, res: Response) => {
  try {
    const { specialization, excludeDoctorId } = req.query as Record<string, string>;
    const provider = providerManager.getActiveProvider();
    const all = await provider.getDoctors({});

    const alternatives = all.data.filter(
      (d) =>
        d.id !== excludeDoctorId &&
        (!specialization || d.specialization.toLowerCase().includes(specialization.toLowerCase()))
    );

    return res.json({
      success: true,
      count: alternatives.length,
      data: alternatives.slice(0, 3),
      reason:
        alternatives.length > 0
          ? `Found ${alternatives.length} nearby verified doctor(s) specializing in ${specialization || 'General Care'}.`
          : 'No other active doctor found for this department.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const registerDoctor = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const newDoc = db.registerDoctor(payload);

    try {
      const doc = new Doctor({
        ...payload,
        doctorId: newDoc.id,
        verificationStatus: 'pending_verification',
      });
      await doc.save();
    } catch {
      // Fallback
    }

    return res.status(201).json({
      success: true,
      message: 'Doctor registration submitted for administrative verification.',
      data: newDoc,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const verifyDoctor = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action, verifiedBy } = req.body;

    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json({
        success: false,
        error: "Action must be either 'approve' or 'reject'",
      });
    }

    const verified = db.verifyDoctor(id, action, verifiedBy || req.user?.name || 'Medical Board');
    if (!verified) {
      return res.status(404).json({
        success: false,
        error: `Doctor with ID '${id}' not found.`,
      });
    }

    try {
      await Doctor.findOneAndUpdate(
        { doctorId: id },
        { verificationStatus: action === 'approve' ? 'verified' : 'rejected' }
      );
    } catch {
      // Ignore
    }

    return res.json({
      success: true,
      message: `Doctor registration ${action === 'approve' ? 'approved and verified' : 'rejected'}.`,
      data: verified,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateDoctorProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};

    const doc = db.doctors.find((d) => d.id === id);
    if (!doc) {
      return res.status(404).json({ success: false, error: `Doctor with ID '${id}' not found.` });
    }

    if (updates.name !== undefined) doc.name = updates.name;
    if (updates.nameMr !== undefined) doc.nameMr = updates.nameMr;
    if (updates.contactNumber !== undefined) doc.contactNumber = updates.contactNumber;
    if (updates.consultationType !== undefined) doc.consultationType = updates.consultationType;
    if (updates.opdTimings !== undefined) doc.opdTimings = updates.opdTimings;
    if (updates.avatarUrl !== undefined) doc.avatarUrl = updates.avatarUrl;
    if (updates.specialization !== undefined) doc.specialization = updates.specialization;
    if (updates.specializationMr !== undefined) doc.specializationMr = updates.specializationMr;
    if (updates.qualification !== undefined) doc.qualification = updates.qualification;
    if (updates.languages !== undefined && Array.isArray(updates.languages)) doc.languages = updates.languages;
    if (updates.experienceYears !== undefined) doc.experienceYears = Number(updates.experienceYears);

    // Keep availability synced if timings or consultation type updated
    const avail = db.getDoctorAvailability(id);
    if (avail) {
      if (updates.opdTimings) avail.activeShift = updates.opdTimings;
      if (updates.consultationType) avail.consultationType = updates.consultationType;
      avail.lastUpdated = new Date().toISOString();
      emitDoctorAvailabilityUpdate(id, avail);
    }

    try {
      await Doctor.findOneAndUpdate({ doctorId: id }, { ...updates }, { new: true });
    } catch {
      // Fallback
    }

    return res.json({
      success: true,
      message: 'Doctor profile updated successfully.',
      data: doc,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
