import {
  Facility,
  Doctor,
  DoctorAvailability,
  Appointment,
  Prescription,
  HealthRecord,
  GovernmentScheme,
  MedicineStock,
  HealthCamp,
  AuditLogEntry,
} from '../types';

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  count?: number;
  source?: string;
  sourceUrl?: string;
  lastUpdated?: string;
  isDemo?: boolean;
  provider?: string;
  message?: string;
  error?: string;
  profile?: any;
  photoUrl?: string;
}

class ApiClient {
  private getAuthToken(): string | null {
    try {
      return (
        localStorage.getItem('gramarogya_jwt_auth_token') ||
        localStorage.getItem('gramarogya_auth_token') ||
        null
      );
    } catch {
      return null;
    }
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...((options?.headers as Record<string, string>) || {}),
      };

      const response = await fetch(endpoint, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          data: null,
          error: errorData.error || `Server responded with status ${response.status}`,
          message: errorData.message,
        };
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        data: null,
        error: 'Unable to connect to verified health backend.',
        message: err?.message,
      };
    }
  }

  // Facilities
  public async getFacilities(filters?: { district?: string; taluka?: string; type?: string }): Promise<ApiResponse<Facility[]>> {
    const params = new URLSearchParams();
    if (filters?.district) params.append('district', filters.district);
    if (filters?.taluka) params.append('taluka', filters.taluka);
    if (filters?.type) params.append('type', filters.type);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<Facility[]>(`/api/facilities${queryStr}`);
  }

  public async getNearbyFacilities(lat: number, lng: number, radius = 50): Promise<ApiResponse<Facility[]>> {
    return this.request<Facility[]>(`/api/facilities/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  }

  public async getFacilityById(id: string): Promise<ApiResponse<Facility>> {
    return this.request<Facility>(`/api/facilities/${id}`);
  }

  public async registerFacility(payload: Partial<Facility>): Promise<ApiResponse<Facility>> {
    return this.request<Facility>('/api/facilities', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Doctors
  public async getDoctors(filters?: { facilityId?: string; specialization?: string; includePending?: boolean }): Promise<ApiResponse<Doctor[]>> {
    const params = new URLSearchParams();
    if (filters?.facilityId) params.append('facilityId', filters.facilityId);
    if (filters?.specialization) params.append('specialization', filters.specialization);
    if (filters?.includePending) params.append('includePending', 'true');

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<Doctor[]>(`/api/doctors${queryStr}`);
  }

  public async getDoctorById(id: string): Promise<ApiResponse<Doctor>> {
    return this.request<Doctor>(`/api/doctors/${id}`);
  }

  public async registerDoctor(payload: Partial<Doctor>): Promise<ApiResponse<Doctor>> {
    return this.request<Doctor>('/api/doctors/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async verifyDoctor(id: string, action: 'approve' | 'reject', verifiedBy?: string): Promise<ApiResponse<Doctor>> {
    return this.request<Doctor>(`/api/doctors/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ action, verifiedBy }),
    });
  }

  // Doctor Availability
  public async getDoctorAvailability(doctorId: string): Promise<ApiResponse<DoctorAvailability>> {
    return this.request<DoctorAvailability>(`/api/doctors/${doctorId}/availability`);
  }

  public async updateDoctorAvailability(
    doctorId: string,
    payload: {
      status: string;
      activeShift?: string;
      notes?: string;
      updatedBy?: string;
      opdTimings?: string;
      consultationType?: string;
    }
  ): Promise<ApiResponse<DoctorAvailability>> {
    return this.request<DoctorAvailability>(`/api/doctors/${doctorId}/availability`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Appointments
  public async getAppointments(filters?: { patientId?: string; doctorId?: string; facilityId?: string; status?: string }): Promise<ApiResponse<Appointment[]>> {
    const params = new URLSearchParams();
    if (filters?.patientId) params.append('patientId', filters.patientId);
    if (filters?.doctorId) params.append('doctorId', filters.doctorId);
    if (filters?.facilityId) params.append('facilityId', filters.facilityId);
    if (filters?.status) params.append('status', filters.status);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<Appointment[]>(`/api/appointments${queryStr}`);
  }

  public async createAppointment(payload: Partial<Appointment>): Promise<ApiResponse<Appointment>> {
    return this.request<Appointment>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateAppointmentStatus(
    id: string,
    payload: {
      status?: string;
      doctorNotes?: string;
      diagnosis?: string;
      prescription?: any;
      newDate?: string;
      newTimeSlot?: string;
      telemedicineRoomId?: string;
      telemedicineLink?: string;
      telemedicineNotes?: string;
      telemedicineSuggestedBy?: string;
      consultationType?: string;
    }
  ): Promise<ApiResponse<Appointment>> {
    return this.request<Appointment>(`/api/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // Prescriptions & Medical Records
  public async getPrescriptions(filters?: { patientId?: string; doctorId?: string }): Promise<ApiResponse<Prescription[]>> {
    const params = new URLSearchParams();
    if (filters?.patientId) params.append('patientId', filters.patientId);
    if (filters?.doctorId) params.append('doctorId', filters.doctorId);
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<Prescription[]>(`/api/prescriptions${queryStr}`);
  }

  public async createPrescription(payload: Partial<Prescription>): Promise<ApiResponse<Prescription>> {
    return this.request<Prescription>('/api/prescriptions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getHealthRecords(filters?: { patientId?: string; category?: string }): Promise<ApiResponse<HealthRecord[]>> {
    const params = new URLSearchParams();
    if (filters?.patientId) params.append('patientId', filters.patientId);
    if (filters?.category) params.append('category', filters.category);
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<HealthRecord[]>(`/api/health-records${queryStr}`);
  }

  public async uploadHealthRecord(payload: Partial<HealthRecord>): Promise<ApiResponse<HealthRecord>> {
    return this.request<HealthRecord>('/api/health-records', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async suggestTelemedicine(
    id: string,
    payload?: { doctorNotes?: string; customLink?: string }
  ): Promise<ApiResponse<Appointment>> {
    return this.request<Appointment>(`/api/appointments/${id}/suggest-telemedicine`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  }

  public async acceptTelemedicine(id: string): Promise<ApiResponse<Appointment>> {
    return this.request<Appointment>(`/api/appointments/${id}/accept-telemedicine`, {
      method: 'POST',
    });
  }

  // Health Schemes & Medicines
  public async getHealthSchemes(): Promise<ApiResponse<GovernmentScheme[]>> {
    return this.request<GovernmentScheme[]>('/api/health-schemes');
  }

  public async getMedicines(facilityId?: string): Promise<ApiResponse<MedicineStock[]>> {
    const query = facilityId ? `?facilityId=${facilityId}` : '';
    return this.request<MedicineStock[]>(`/api/medicines${query}`);
  }

  public async getHealthCamps(district?: string): Promise<ApiResponse<HealthCamp[]>> {
    const query = district ? `?district=${district}` : '';
    return this.request<HealthCamp[]>(`/api/health-camps${query}`);
  }

  public async registerForCamp(campId: string): Promise<ApiResponse<HealthCamp>> {
    return this.request<HealthCamp>(`/api/health-camps/${campId}/register`, {
      method: 'POST',
    });
  }

  // Location Geocoding
  public async searchLocations(query: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/api/location/search?q=${encodeURIComponent(query)}`);
  }

  // Audit Logs
  public async getAuditLogs(): Promise<ApiResponse<AuditLogEntry[]>> {
    return this.request<AuditLogEntry[]>('/api/audit-logs');
  }

  // Data Mode
  public async getDataMode(): Promise<ApiResponse<{ isLiveMode: boolean; providers: any[]; activeProvider: string }>> {
    return this.request<{ isLiveMode: boolean; providers: any[]; activeProvider: string }>('/api/data-mode');
  }

  public async setDataMode(isLiveMode: boolean, providerType?: string): Promise<ApiResponse<any>> {
    return this.request('/api/data-mode', {
      method: 'POST',
      body: JSON.stringify({ isLiveMode, providerType }),
    });
  }

  // AI Health Chatbot Client-Server API
  public async sendChatMessage(params: {
    message: string;
    language?: 'mr' | 'hi' | 'en';
    userId?: string;
    userName?: string;
    userRole?: string;
    conversationHistory?: any[];
    userLat?: number;
    userLng?: number;
  }): Promise<ApiResponse<any>> {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // AI Navigator & Assistant
  public async queryAiNavigator(query: string, language = 'mr', userLat = 21.3966, userLng = 79.3274): Promise<any> {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: query, query, language, userLat, userLng }),
    });
  }

  public async queryAiAssistant(message: string, language = 'mr', conversationHistory?: any[]): Promise<any> {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, language, conversationHistory }),
    });
  }

  // Patient Profile APIs (Permanent Database Persistence)
  public async getProfile(): Promise<ApiResponse<any>> {
    return this.request('/api/patient/profile');
  }

  public async updateProfile(profileData: any): Promise<ApiResponse<any>> {
    return this.request('/api/patient/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  public async uploadProfilePhoto(photoBase64: string): Promise<ApiResponse<{ photoUrl: string }>> {
    return this.request('/api/patient/profile/photo', {
      method: 'POST',
      body: JSON.stringify({ photo: photoBase64 }),
    });
  }

  // Doctor Profile update
  public async updateDoctorProfile(id: string, payload: Partial<Doctor>): Promise<ApiResponse<Doctor>> {
    return this.request<Doctor>(`/api/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // Notifications API (Database persistent)
  public async getNotifications(unreadOnly = false): Promise<ApiResponse<any[]>> {
    const query = unreadOnly ? '?unreadOnly=true' : '';
    return this.request<any[]>(`/api/notifications${query}`);
  }

  public async markNotificationAsRead(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  public async markAllNotificationsAsRead(): Promise<ApiResponse<any>> {
    return this.request('/api/notifications/read-all', {
      method: 'PATCH',
    });
  }
}

export const apiClient = new ApiClient();
