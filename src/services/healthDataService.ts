import {
  Facility,
  Doctor,
  DoctorAvailability,
  Appointment,
  Prescription,
  MedicineStock,
  HealthCamp,
  GovernmentScheme,
  EmergencyRequest,
} from '../types';
import { apiClient } from './apiClient';

export interface DataFetchResult<T> {
  data: T | null;
  isDemoData?: boolean;
  source: string;
  sourceUrl?: string;
  lastUpdated: string;
  isAvailable: boolean;
  unavailableReason?: string;
  count?: number;
}

export class HealthDataService {
  /**
   * Fetch Facilities dynamically from backend REST API
   */
  public static async getFacilities(
    filters?: { district?: string; taluka?: string; type?: string }
  ): Promise<DataFetchResult<Facility[]>> {
    try {
      const response = await apiClient.getFacilities(filters);
      const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      if (!response.success || !response.data) {
        return {
          data: null,
          
          source: 'National Health Facility Registry (HFR) / MahaArogya Directory',
          lastUpdated: now,
          isAvailable: false,
          unavailableReason: response.error || 'Verified facility data is currently unreachable.',
        };
      }

      return {
        data: response.data,
        count: response.data.length,
        
        source: response.source || 'National Health Facility Registry (HFR) - MOHFW',
        sourceUrl: response.sourceUrl,
        lastUpdated: response.lastUpdated ? new Date(response.lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : now,
        isAvailable: true,
      };
    } catch {
      return {
        data: null,
        
        source: 'MahaArogya Health Directory',
        lastUpdated: 'Just now',
        isAvailable: false,
        unavailableReason: 'Unable to connect to verified health backend.',
      };
    }
  }

  /**
   * Fetch Nearby Facilities with real GPS coordinates and Haversine distance
   */
  public static async getNearbyFacilities(
    lat: number,
    lng: number,
    radius = 50
  ): Promise<DataFetchResult<Facility[]>> {
    try {
      const response = await apiClient.getNearbyFacilities(lat, lng, radius);
      const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      if (!response.success || !response.data) {
        return {
          data: null,
          
          source: 'OpenStreetMap & HFR GIS Registry',
          lastUpdated: now,
          isAvailable: false,
          unavailableReason: response.error || 'Unable to calculate nearby healthcare facilities.',
        };
      }

      return {
        data: response.data,
        count: response.data.length,
        
        source: response.source || 'OpenStreetMap Haversine Distance & HFR Registry',
        lastUpdated: now,
        isAvailable: true,
      };
    } catch {
      return {
        data: null,
        
        source: 'GIS Geo-Distance Pipeline',
        lastUpdated: 'Just now',
        isAvailable: false,
        unavailableReason: 'Location lookup failed. Please select your location manually.',
      };
    }
  }

  /**
   * Fetch Doctors dynamically from backend API
   */
  public static async getDoctors(
    filters?: { facilityId?: string; specialization?: string; includePending?: boolean }
  ): Promise<DataFetchResult<Doctor[]>> {
    try {
      const response = await apiClient.getDoctors(filters);
      const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      if (!response.success || !response.data) {
        return {
          data: null,
          
          source: 'Healthcare Professionals Registry (HPR) - ABDM National Registry',
          lastUpdated: now,
          isAvailable: false,
          unavailableReason: response.error || 'Verified doctor registry currently unavailable.',
        };
      }

      return {
        data: response.data,
        count: response.data.length,
        
        source: response.source || 'Healthcare Professionals Registry (HPR) & MMC Cadre',
        lastUpdated: response.lastUpdated ? new Date(response.lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : now,
        isAvailable: true,
      };
    } catch {
      return {
        data: null,
        
        source: 'Healthcare Professionals Registry',
        lastUpdated: 'Just now',
        isAvailable: false,
        unavailableReason: 'Doctor registry connection failed.',
      };
    }
  }

  /**
   * Fetch Doctor Real-Time Availability
   */
  public static async getDoctorAvailability(doctorId: string): Promise<DataFetchResult<DoctorAvailability>> {
    try {
      const response = await apiClient.getDoctorAvailability(doctorId);
      const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      if (!response.success || !response.data) {
        return {
          data: null,
          
          source: 'Facility Real-Time OPD Queue Dispatcher',
          lastUpdated: now,
          isAvailable: false,
          unavailableReason: 'Real-time telemetry unavailable for this doctor.',
        };
      }

      return {
        data: response.data,
        
        source: response.source || 'Facility Real-Time OPD Queue Dispatcher',
        lastUpdated: response.lastUpdated ? new Date(response.lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : now,
        isAvailable: true,
      };
    } catch {
      return {
        data: null,
        
        source: 'Facility OPD Queue',
        lastUpdated: 'Just now',
        isAvailable: false,
      };
    }
  }

  /**
   * Fetch Essential Medicines
   */
  public static async getMedicineStock(facilityId?: string): Promise<DataFetchResult<MedicineStock[]>> {
    try {
      const response = await apiClient.getMedicines(facilityId);
      const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      if (!response.success || !response.data) {
        return {
          data: null,
          
          source: 'e-Aushadhi / DVDMS Portal - Govt. of Maharashtra',
          lastUpdated: now,
          isAvailable: false,
          unavailableReason: response.error || 'Medicine stock inventory unavailable.',
        };
      }

      return {
        data: response.data,
        count: response.data.length,
        
        source: response.source || 'e-Aushadhi / DVDMS Central Warehouse',
        lastUpdated: now,
        isAvailable: true,
      };
    } catch {
      return {
        data: null,
        
        source: 'DVDMS Logistics',
        lastUpdated: 'Just now',
        isAvailable: false,
      };
    }
  }

  /**
   * Fetch Government Schemes
   */
  public static async getSchemes(): Promise<DataFetchResult<GovernmentScheme[]>> {
    try {
      const response = await apiClient.getHealthSchemes();
      const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      return {
        data: response.data || [],
        count: response.data ? response.data.length : 0,
        
        source: response.source || 'Official Gazette & Public Health Dept, Govt. of Maharashtra',
        lastUpdated: now,
        isAvailable: true,
      };
    } catch {
      return {
        data: [],
        
        source: 'Official Gazette',
        lastUpdated: 'Just now',
        isAvailable: false,
      };
    }
  }

  /**
   * Fetch Health Camps
   */
  public static async getHealthCamps(district?: string): Promise<DataFetchResult<HealthCamp[]>> {
    try {
      const response = await apiClient.getHealthCamps(district);
      const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      return {
        data: response.data || [],
        count: response.data ? response.data.length : 0,
        
        source: response.source || 'District Health Society Outreach Bulletin',
        lastUpdated: now,
        isAvailable: true,
      };
    } catch {
      return {
        data: [],
        
        source: 'District Health Society',
        lastUpdated: 'Just now',
        isAvailable: false,
      };
    }
  }

  /**
   * Fetch Appointments
   */
  public static async getAppointments(filters?: { patientId?: string; doctorId?: string; facilityId?: string; status?: string }): Promise<DataFetchResult<Appointment[]>> {
    try {
      const response = await apiClient.getAppointments(filters);
      const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      return {
        data: response.data || [],
        count: response.data ? response.data.length : 0,
        
        source: 'MahaArogya Central Appointment Database',
        lastUpdated: now,
        isAvailable: true,
      };
    } catch {
      return {
        data: [],
        
        source: 'Central Database',
        lastUpdated: 'Just now',
        isAvailable: false,
      };
    }
  }

  /**
   * Emergency 108 Status
   */
  public static getEmergencyStatus(requests: EmergencyRequest[]): DataFetchResult<EmergencyRequest[]> {
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return {
      data: requests,
      
      source: 'Maharashtra 108 Emergency Response Center (MEMS / EMRI CAD System)',
      lastUpdated: now,
      isAvailable: true,
    };
  }
}
