import { Request, Response } from 'express';
import { Appointment } from '../models/Appointment';
import { Notification } from '../models/Notification';
import { db } from '../db/store';
import { emitNotification, emitAppointmentUpdate } from '../socket';
import { AuthRequest } from '../middleware/auth';

export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, doctorId, facilityId, status } = req.query as Record<string, string>;

    try {
      const query: any = {};
      if (patientId) query.patientId = patientId;
      if (doctorId) query.doctorId = doctorId;
      if (facilityId) query.facilityId = facilityId;
      if (status) query.status = status;

      const mongoAppts = await Appointment.find(query).sort({ createdAt: -1 });
      if (mongoAppts.length > 0) {
        return res.json({
          success: true,
          count: mongoAppts.length,
          source: 'MongoDB Atlas - e-Hospital Maharashtra',
          data: mongoAppts,
        });
      }
    } catch {
      // Fallback
    }

    const appts = db.getAppointments({ patientId, doctorId, facilityId, status });
    return res.json({
      success: true,
      count: appts.length,
      source: 'e-Hospital Maharashtra Public Health System',
      data: appts,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const payload = req.body;
    if (!payload.patientName || !payload.patientMobile || !payload.doctorId) {
      return res.status(400).json({
        success: false,
        error: 'Patient name, mobile number, and doctor selection are required.',
      });
    }

    // Security: Use authenticated patient user identity when available
    if (req.user && req.user.role === 'patient') {
      payload.patientId = req.user.id;
      if (req.user.name && !payload.patientName) {
        payload.patientName = req.user.name;
      }
      if (req.user.mobile && !payload.patientMobile) {
        payload.patientMobile = req.user.mobile;
      }
    }

    // Default status to 'Pending' (or 'Confirmed' if booked at clinic)
    const initialStatus = payload.status || 'Pending';
    const appt = db.createAppointment({
      ...payload,
      status: initialStatus,
    });

    try {
      const mongoAppt = new Appointment({
        ...payload,
        tokenNumber: appt.tokenNumber,
        status: appt.status,
      });
      await mongoAppt.save();
    } catch {
      // Fallback
    }

    const notifPayload = {
      title: 'नवीन रुग्ण अपॉइंटमेंट / New Appointment Request',
      message: `Token #${appt.tokenNumber}: ${payload.patientName} (${payload.patientVillage || 'Rural'}) has requested a consultation for ${payload.date} at ${payload.timeSlot}.`,
      type: 'APPOINTMENT_BOOKED',
      appointmentId: appt.id,
      patientName: payload.patientName,
      tokenNumber: appt.tokenNumber,
      timestamp: new Date().toISOString(),
    };

    // Store persistent notification for doctor
    db.addNotification({
      userId: payload.doctorId,
      recipientRole: 'doctor',
      title: notifPayload.title,
      message: notifPayload.message,
      type: notifPayload.type,
      appointmentId: appt.id,
    });

    try {
      const mongoNotif = new Notification({
        userId: payload.doctorId,
        recipientRole: 'doctor',
        title: notifPayload.title,
        message: notifPayload.message,
        type: notifPayload.type,
        appointmentId: appt.id,
      });
      await mongoNotif.save();
    } catch {
      // Fallback
    }

    // Real-time socket notification to doctor
    emitNotification(payload.doctorId, notifPayload);

    // Broadcast appointment update to doctor & patient
    emitAppointmentUpdate(appt);

    return res.status(201).json({
      success: true,
      message: `Appointment request submitted! Your Token Number is #${appt.tokenNumber}.`,
      data: appt,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      status,
      doctorNotes,
      diagnosis,
      prescription,
      newDate,
      newTimeSlot,
      telemedicineRoomId,
      telemedicineLink,
      telemedicineNotes,
      telemedicineSuggestedBy,
      consultationType,
    } = req.body;

    const validStatuses = [
      'Pending',
      'Confirmed',
      'Completed',
      'Cancelled',
      'Rescheduled',
      'Telemedicine_Suggested',
      'Telemedicine_Accepted',
    ];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    let finalRoomId = telemedicineRoomId;
    let finalLink = telemedicineLink;

    if (status === 'Confirmed' && !finalLink) {
      const appt = db.getAppointments({}).find(a => a.id === id);
      if (appt && appt.consultationType === 'Telemedicine (Video)') {
        finalRoomId = `room-${id}-${Date.now()}`;
        finalLink = `/telemedicine?appointmentId=${id}`;
      }
    }

    const updated = db.updateAppointmentStatus(id, {
      status: status || 'Confirmed',
      doctorNotes,
      diagnosis,
      prescription,
      newDate,
      newTimeSlot,
      telemedicineRoomId: finalRoomId,
      telemedicineLink: finalLink,
      telemedicineNotes,
      telemedicineSuggestedBy,
      consultationType,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Appointment with ID '${id}' not found.`,
      });
    }

    try {
      await Appointment.findByIdAndUpdate(id, {
        ...(status && { status }),
        ...(doctorNotes && { doctorNotes }),
        ...(newDate && { date: newDate }),
        ...(newTimeSlot && { timeSlot: newTimeSlot }),
        ...(telemedicineRoomId && { telemedicineRoomId }),
        ...(telemedicineLink && { telemedicineLink }),
        ...(telemedicineNotes && { telemedicineNotes }),
        ...(telemedicineSuggestedBy && { telemedicineSuggestedBy }),
        ...(consultationType && { consultationType }),
      });
    } catch {
      // Ignore
    }

    // Notify patient about the update
    let notifTitle = 'अपॉइंटमेंट अपडेट / Appointment Updated';
    let notifMsg = `Your appointment #${updated.tokenNumber} has been updated to '${updated.status}'.`;

    if (updated.status === 'Confirmed') {
      notifTitle = 'अपॉइंटमेंट मंजूर / Appointment Confirmed';
      notifMsg = `Dr. ${updated.doctorName} has confirmed your appointment (#${updated.tokenNumber}) for ${updated.date} at ${updated.timeSlot}.`;
    } else if (updated.status === 'Telemedicine_Suggested') {
      notifTitle = 'व्हिडिओ सल्लामसलत सुचवली / Telemedicine Suggested';
      notifMsg = `Dr. ${updated.doctorName} has suggested a video teleconsultation for Token #${updated.tokenNumber}. Click to join!`;
    } else if (updated.status === 'Cancelled') {
      notifTitle = 'अपॉइंटमेंट रद्द / Appointment Cancelled';
      notifMsg = `Your appointment #${updated.tokenNumber} was cancelled. Reason: ${doctorNotes || 'Doctor unavailable'}.`;
    } else if (updated.status === 'Rescheduled') {
      notifTitle = 'वेळ बदलली आहे / Appointment Rescheduled';
      notifMsg = `Dr. ${updated.doctorName} rescheduled your appointment (#${updated.tokenNumber}) to ${updated.date} at ${updated.timeSlot}.`;
    } else if (updated.status === 'Completed') {
      notifTitle = 'सल्लामसलत पूर्ण / Consultation Completed';
      notifMsg = `Your consultation with Dr. ${updated.doctorName} is completed. Your digital prescription is ready in My Profile.`;
    }

    const patientNotif = {
      title: notifTitle,
      message: notifMsg,
      type: `APPOINTMENT_${updated.status.toUpperCase()}`,
      appointmentId: updated.id,
      tokenNumber: updated.tokenNumber,
      status: updated.status,
      timestamp: new Date().toISOString(),
    };

    // Store persistent notification for patient
    db.addNotification({
      userId: updated.patientId,
      recipientRole: 'patient',
      title: patientNotif.title,
      message: patientNotif.message,
      type: patientNotif.type,
      appointmentId: updated.id,
    });

    try {
      const mongoNotif = new Notification({
        userId: updated.patientId,
        recipientRole: 'patient',
        title: patientNotif.title,
        message: patientNotif.message,
        type: patientNotif.type,
        appointmentId: updated.id,
      });
      await mongoNotif.save();
    } catch {
      // Fallback
    }

    emitNotification(updated.patientId, patientNotif);

    // Broadcast appointment update to doctor & patient
    emitAppointmentUpdate(updated);

    return res.json({
      success: true,
      message: `Appointment #${updated.tokenNumber} updated to '${updated.status}'.`,
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const suggestTelemedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { doctorNotes, customLink } = req.body;

    const apt = db.getAppointments().find((a) => a.id === id);
    if (!apt) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    const roomId = `tele-${apt.tokenNumber.toLowerCase()}-${Date.now().toString(36)}`;
    const link = customLink || `/telemedicine?room=${roomId}&aptId=${apt.id}`;

    const updated = db.updateAppointmentStatus(id, {
      status: 'Telemedicine_Suggested',
      consultationType: 'Telemedicine (Video)',
      telemedicineRoomId: roomId,
      telemedicineLink: link,
      telemedicineNotes: doctorNotes || 'Doctor suggests convenient video consultation from home.',
      telemedicineSuggestedBy: req.user?.name || apt.doctorName || 'Doctor',
    });

    if (updated) {
      try {
        await Appointment.findByIdAndUpdate(id, {
          status: 'Telemedicine_Suggested',
          consultationType: 'Telemedicine (Video)',
          telemedicineRoomId: roomId,
          telemedicineLink: link,
          telemedicineNotes: doctorNotes,
        });
      } catch {
        // Ignore
      }

      const notifData = {
        title: 'व्हिडिओ सल्लामसलत सुचवली / Telemedicine Suggested',
        message: `Dr. ${apt.doctorName} has suggested a video consultation for Token #${apt.tokenNumber}. You can consult from your home!`,
        type: 'TELEMEDICINE_SUGGESTED',
        appointmentId: apt.id,
        roomId,
        link,
        timestamp: new Date().toISOString(),
      };

      db.addNotification({
        userId: apt.patientId,
        recipientRole: 'patient',
        title: notifData.title,
        message: notifData.message,
        type: notifData.type,
        appointmentId: apt.id,
      });

      try {
        const mongoNotif = new Notification({
          userId: apt.patientId,
          recipientRole: 'patient',
          title: notifData.title,
          message: notifData.message,
          type: notifData.type,
          appointmentId: apt.id,
        });
        await mongoNotif.save();
      } catch {
        // Fallback
      }

      // Notify patient immediately
      emitNotification(apt.patientId, notifData);
      emitAppointmentUpdate(updated);
    }

    return res.json({
      success: true,
      message: 'Telemedicine consultation suggested to patient successfully.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const acceptTelemedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const apt = db.getAppointments().find((a) => a.id === id);
    if (!apt) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    const updated = db.updateAppointmentStatus(id, {
      status: 'Telemedicine_Accepted',
      consultationType: 'Telemedicine (Video)',
    });

    if (updated) {
      try {
        await Appointment.findByIdAndUpdate(id, {
          status: 'Telemedicine_Accepted',
        });
      } catch {
        // Ignore
      }

      const docNotif = {
        title: 'रुग्ण व्हिडिओ कॉलसाठी तयार / Patient Joined Telemedicine',
        message: `Patient ${apt.patientName} (Token #${apt.tokenNumber}) has accepted and entered the video consultation room.`,
        type: 'TELEMEDICINE_ACCEPTED',
        appointmentId: apt.id,
        roomId: apt.telemedicineRoomId,
        timestamp: new Date().toISOString(),
      };

      db.addNotification({
        userId: apt.doctorId,
        recipientRole: 'doctor',
        title: docNotif.title,
        message: docNotif.message,
        type: docNotif.type,
        appointmentId: apt.id,
      });

      try {
        const mongoNotif = new Notification({
          userId: apt.doctorId,
          recipientRole: 'doctor',
          title: docNotif.title,
          message: docNotif.message,
          type: docNotif.type,
          appointmentId: apt.id,
        });
        await mongoNotif.save();
      } catch {
        // Fallback
      }

      // Notify doctor that patient has joined
      emitNotification(apt.doctorId, docNotif);
      emitAppointmentUpdate(updated);
    }

    return res.json({
      success: true,
      message: 'Telemedicine consultation accepted.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
