import {
  FacilityRecord,
  DoctorRecord,
  DoctorAvailabilityRecord,
  HealthSchemeRecord,
  MedicineStockRecord,
  HealthCampRecord,
} from '../models/types';

export interface ProviderResponse<T> {
  success: boolean;
  data: T | null;
  providerName: string;
  source: string;
  sourceUrl?: string;
  lastUpdated: string;
  isDemo: boolean;
  message?: string;
}

export interface HealthcareDataProvider {
  readonly name: string;
  readonly type: 'government' | 'directory' | 'abdm' | 'demo';
  readonly isConnected: boolean;

  getFacilities(options?: { district?: string; taluka?: string; type?: string; query?: string }): Promise<ProviderResponse<FacilityRecord[]>>;
  getNearbyFacilities(lat: number, lng: number, radiusKm: number): Promise<ProviderResponse<FacilityRecord[]>>;
  getFacilityById(id: string): Promise<ProviderResponse<FacilityRecord>>;
  
  getDoctors(options?: { facilityId?: string; specialization?: string; includePending?: boolean }): Promise<ProviderResponse<DoctorRecord[]>>;
  getDoctorById(id: string): Promise<ProviderResponse<DoctorRecord>>;
  getDoctorAvailability(doctorId: string): Promise<ProviderResponse<DoctorAvailabilityRecord>>;
  
  getHealthSchemes(): Promise<ProviderResponse<HealthSchemeRecord[]>>;
  getMedicineStock(facilityId?: string): Promise<ProviderResponse<MedicineStockRecord[]>>;
  getHealthCamps(district?: string): Promise<ProviderResponse<HealthCampRecord[]>>;
}
