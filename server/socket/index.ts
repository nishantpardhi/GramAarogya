import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

let ioInstance: SocketIOServer | null = null;

export const initSocketIO = (httpServer: HTTPServer) => {
  ioInstance = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  ioInstance.on('connection', (socket: Socket) => {
    console.log(`⚡ Client connected to Socket.IO: ${socket.id}`);

    // Join room based on user role or user ID
    socket.on('join_room', (room: string) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    // Join doctor's specific channel
    socket.on('join_doctor_channel', (doctorId: string) => {
      socket.join(`doctor_${doctorId}`);
      socket.join(`user_${doctorId}`);
    });

    // Join patient channel
    socket.on('join_patient_channel', (patientId: string) => {
      socket.join(`patient_${patientId}`);
      socket.join(`user_${patientId}`);
    });

    // Join telemedicine room
    socket.on('join_telemedicine_room', (roomId: string) => {
      socket.join(`telemedicine_${roomId}`);
      socket.to(`telemedicine_${roomId}`).emit('peer_joined_telemedicine', { socketId: socket.id });
    });

    // Telemedicine message
    socket.on('telemedicine_send_message', (data: { roomId: string; sender: string; text: string; time?: string }) => {
      ioInstance?.to(`telemedicine_${data.roomId}`).emit('telemedicine_new_message', data);
    });

    // Join emergency tracking room
    socket.on('join_emergency', (emergencyId: string) => {
      socket.join(`emergency_${emergencyId}`);
    });

    // Handle real-time doctor status updates
    socket.on('doctor_status_change', (data: { doctorId: string; status: string; notes?: string }) => {
      ioInstance?.emit('doctor_status_updated', data);
    });

    // Handle ambulance live location broadcast
    socket.on('ambulance_location_update', (data: { ambulanceId: string; lat: number; lng: number; speed?: number }) => {
      ioInstance?.emit('ambulance_moved', data);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

export const getIO = (): SocketIOServer | null => {
  return ioInstance;
};

export const emitEmergencyUpdate = (emergencyId: string, payload: any) => {
  if (ioInstance) {
    ioInstance.to(`emergency_${emergencyId}`).emit('emergency_status_changed', payload);
    ioInstance.emit('emergency_updated', payload);
  }
};

export const emitDoctorAvailabilityUpdate = (doctorId: string, payload: any) => {
  if (ioInstance) {
    ioInstance.emit('doctor_availability_changed', { doctorId, ...payload });
  }
};

export const emitAppointmentUpdate = (appointment: any) => {
  if (ioInstance) {
    if (appointment.doctorId) {
      ioInstance.to(`doctor_${appointment.doctorId}`).emit('appointment_updated', appointment);
      ioInstance.to(`user_${appointment.doctorId}`).emit('appointment_updated', appointment);
    }
    if (appointment.patientId) {
      ioInstance.to(`patient_${appointment.patientId}`).emit('appointment_updated', appointment);
      ioInstance.to(`user_${appointment.patientId}`).emit('appointment_updated', appointment);
    }
    ioInstance.emit('appointment_status_changed', appointment);
  }
};

export const emitNotification = (userId: string, notification: any) => {
  if (ioInstance) {
    ioInstance.to(`user_${userId}`).emit('new_notification', notification);
    ioInstance.to(`doctor_${userId}`).emit('new_notification', notification);
    ioInstance.to(`patient_${userId}`).emit('new_notification', notification);
    ioInstance.emit('global_notification', notification);
  }
};
