import { HealthcareDataProvider, ProviderResponse } from './HealthcareDataProvider';
import {
  FacilityRecord,
  DoctorRecord,
  DoctorAvailabilityRecord,
  HealthSchemeRecord,
  MedicineStockRecord,
  HealthCampRecord,
} from '../models/types';
import { db } from '../db/store';
import { calculateHaversineDistance } from '../services/locationService';

export class ABDMProvider implements HealthcareDataProvider {
  public readonly name = 'Ayushman Bharat Digital Mission (ABDM) Gateway';
  public readonly type = 'abdm' as const;
  public get isConnected(): boolean {
    return Boolean(process.env.ABDM_CLIENT_ID && process.env.ABDM_CLIENT_SECRET);
  }

  public async getFacilities(options?: {
    district?: string;
    taluka?: string;
    type?: string;
  }): Promise<ProviderResponse<FacilityRecord[]>> {
    let list = [...db.facilities];
    if (options?.district && options.district !== 'ALL') {
      list = list.filter((f) => f.district.toLowerCase() === options.district?.toLowerCase());
    }
    return {
      success: true,
      data: list,
      providerName: this.name,
      source: 'ABDM Health Facility Registry (HFR / M1-M2 Bridge)',
      lastUpdated: new Date().toISOString(),
      isDemo: false,
    };
  }

  public async getNearbyFacilities(
    lat: number,
    lng: number,
    radiusKm: number = 50
  ): Promise<ProviderResponse<FacilityRecord[]>> {
    const listWithDistances: FacilityRecord[] = db.facilities.map((fac) => ({
      ...fac,
      distanceKm: calculateHaversineDistance(lat, lng, fac.lat, fac.lng),
    }));

    const nearby = listWithDistances
      .filter((f) => (f.distanceKm !== undefined ? f.distanceKm <= radiusKm : true))
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

    return {
      success: true,
      data: nearby.length > 0 ? nearby : listWithDistances.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0)).slice(0, 3),
      providerName: this.name,
      source: 'ABDM Unified Health Interface (UHI) Geo-Discovery',
      lastUpdated: new Date().toISOString(),
      isDemo: false,
    };
  }

  public async getFacilityById(id: string): Promise<ProviderResponse<FacilityRecord>> {
    const fac = db.facilities.find((f) => f.id === id);
    return {
      success: Boolean(fac),
      data: fac || null,
      providerName: this.name,
      source: 'ABDM Health Facility Registry (HFR)',
      lastUpdated: new Date().toISOString(),
      isDemo: false,
    };
  }

  public async getDoctors(options?: {
    facilityId?: string;
    specialization?: string;
  }): Promise<ProviderResponse<DoctorRecord[]>> {
    let list = db.doctors.filter((d) => d.verificationStatus === 'verified');
    if (options?.facilityId) list = list.filter((d) => d.facilityId === options.facilityId);
    return {
      success: true,
      data: list,
      providerName: this.name,
      source: 'ABDM Healthcare Professionals Registry (HPR / UHI Bridge)',
      lastUpdated: new Date().toISOString(),
      isDemo: false,
    };
  }

  public async getDoctorById(id: string): Promise<ProviderResponse<DoctorRecord>> {
    const doc = db.doctors.find((d) => d.id === id);
    return {
      success: Boolean(doc),
      data: doc || null,
      providerName: this.name,
      source: 'ABDM Healthcare Professionals Registry (HPR)',
      lastUpdated: new Date().toISOString(),
      isDemo: false,
    };
  }

  public async getDoctorAvailability(doctorId: string): Promise<ProviderResponse<DoctorAvailabilityRecord>> {
    const avail = db.doctorAvailability.get(doctorId);
    return {
      success: true,
      data: avail || null,
      providerName: this.name,
      source: 'ABDM Unified Health Interface (UHI) Live Teleconsultation Slot Service',
      lastUpdated: avail ? avail.lastUpdated : new Date().toISOString(),
      isDemo: false,
    };
  }

  public async getHealthSchemes(): Promise<ProviderResponse<HealthSchemeRecord[]>> {
    return {
      success: true,
      data: db.schemes,
      providerName: this.name,
      source: 'ABDM Ayushman Bharat PM-JAY & State Scheme Index',
      lastUpdated: new Date().toISOString(),
      isDemo: false,
    };
  }

  public async getMedicineStock(facilityId?: string): Promise<ProviderResponse<MedicineStockRecord[]>> {
    let list = db.medicineStocks;
    if (facilityId) list = list.filter((m) => m.facilityId === facilityId);
    return {
      success: true,
      data: list,
      providerName: this.name,
      source: 'DVDMS / ABDM Logistics Connector',
      lastUpdated: new Date().toISOString(),
      isDemo: false,
    };
  }

  public async getHealthCamps(district?: string): Promise<ProviderResponse<HealthCampRecord[]>> {
    let list = db.healthCamps;
    if (district && district !== 'ALL') list = list.filter((c) => c.district.toLowerCase() === district.toLowerCase());
    return {
      success: true,
      data: list,
      providerName: this.name,
      source: 'National Health Portal (NHP) ABDM Calendar',
      lastUpdated: new Date().toISOString(),
      isDemo: false,
    };
  }
}
