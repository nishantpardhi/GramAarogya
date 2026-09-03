import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  public connect(): Socket {
    if (!this.socket) {
      this.socket = io(window.location.origin, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('⚡ Connected to GramAarogya Real-Time Socket Server');
      });

      this.socket.on('connect_error', (error) => {
        console.warn('Socket connection error (graceful fallback):', error.message);
      });
    }
    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public joinRoom(room: string) {
    if (this.socket) {
      this.socket.emit('join_room', room);
    }
  }

  public onEmergencyUpdate(callback: (data: any) => void) {
    if (!this.socket) this.connect();
    this.socket?.on('emergency_updated', callback);
    this.socket?.on('emergency_status_changed', callback);
  }

  public onDoctorStatusUpdate(callback: (data: any) => void) {
    if (!this.socket) this.connect();
    this.socket?.on('doctor_availability_changed', callback);
    this.socket?.on('doctor_status_updated', callback);
  }

  public onNotification(callback: (data: any) => void) {
    if (!this.socket) this.connect();
    this.socket?.on('new_notification', callback);
    this.socket?.on('global_notification', callback);
  }
}

export const socketService = new SocketService();
