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

export class DemoProvider implements HealthcareDataProvider {
  public readonly name = 'GramAarogya Demonstration Sandbox';
  public readonly type = 'demo' as const;
  public readonly isConnected = true;

  public async getFacilities(options?: {
    district?: string;
    taluka?: string;
    type?: string;
  }): Promise<ProviderResponse<FacilityRecord[]>> {
    const demoFacilities: FacilityRecord[] = db.facilities.map((f) => ({
      ...f,
      officialName: `[DEMO] ${f.officialName}`,
      officialNameMr: `[डेमो डेटा] ${f.officialNameMr}`,
      source: 'GramAarogya Evaluation Demonstration Sandbox',
      verificationStatus: 'demo',
      lastUpdated: new Date().toISOString(),
    }));

    let list = demoFacilities;
    if (options?.district && options.district !== 'ALL') {
      list = list.filter((f) => f.district.toLowerCase() === options.district?.toLowerCase());
    }

    return {
      success: true,
      data: list,
      providerName: this.name,
      source: 'Simulated Demo Dataset for Evaluation Showcase',
      lastUpdated: new Date().toISOString(),
      isDemo: true,
    };
  }

  public async getNearbyFacilities(
    lat: number,
    lng: number,
    radiusKm: number = 50
  ): Promise<ProviderResponse<FacilityRecord[]>> {
    const listWithDistances: FacilityRecord[] = db.facilities.map((fac) => ({
      ...fac,
      officialName: `[DEMO] ${fac.officialName}`,
      officialNameMr: `[डेमो डेटा] ${fac.officialNameMr}`,
      distanceKm: calculateHaversineDistance(lat, lng, fac.lat, fac.lng),
      verificationStatus: 'demo',
      source: 'GramAarogya Evaluation Demo Sandbox',
    }));

    const nearby = listWithDistances
      .filter((f) => (f.distanceKm !== undefined ? f.distanceKm <= radiusKm : true))
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

    return {
      success: true,
      data: nearby.length > 0 ? nearby : listWithDistances.slice(0, 3),
      providerName: this.name,
      source: 'Demonstration GPS Coordinates & Distance Simulation',
      lastUpdated: new Date().toISOString(),
      isDemo: true,
    };
  }

  public async getFacilityById(id: string): Promise<ProviderResponse<FacilityRecord>> {
    const fac = db.facilities.find((f) => f.id === id);
    if (!fac) {
      return {
        success: false,
        data: null,
        providerName: this.name,
        source: 'Demo Registry',
        lastUpdated: new Date().toISOString(),
        isDemo: true,
        message: 'Demo facility not found.',
      };
    }
    return {
      success: true,
      data: {
        ...fac,
        officialName: `[DEMO] ${fac.officialName}`,
        verificationStatus: 'demo',
      },
      providerName: this.name,
      source: 'Demo Registry',
      lastUpdated: new Date().toISOString(),
      isDemo: true,
    };
  }

  public async getDoctors(options?: {
    facilityId?: string;
    specialization?: string;
  }): Promise<ProviderResponse<DoctorRecord[]>> {
    const demoDocs: DoctorRecord[] = db.doctors.map((d) => ({
      ...d,
      name: `[DEMO] ${d.name}`,
      nameMr: `[डेमो] ${d.nameMr}`,
      verificationStatus: 'demo',
      source: 'Demo Doctor Profile Sandbox',
    }));

    let list = demoDocs;
    if (options?.facilityId) list = list.filter((d) => d.facilityId === options.facilityId);

    return {
      success: true,
      data: list,
      providerName: this.name,
      source: 'Simulated Demo Doctor Directory',
      lastUpdated: new Date().toISOString(),
      isDemo: true,
    };
  }

  public async getDoctorById(id: string): Promise<ProviderResponse<DoctorRecord>> {
    const doc = db.doctors.find((d) => d.id === id);
    return {
      success: Boolean(doc),
      data: doc
        ? { ...doc, name: `[DEMO] ${doc.name}`, verificationStatus: 'demo' }
        : null,
      providerName: this.name,
      source: 'Demo Registry',
      lastUpdated: new Date().toISOString(),
      isDemo: true,
    };
  }

  public async getDoctorAvailability(doctorId: string): Promise<ProviderResponse<DoctorAvailabilityRecord>> {
    const avail = db.doctorAvailability.get(doctorId);
    return {
      success: true,
      data: avail
        ? {
            ...avail,
            statusText: `[DEMO] ${avail.statusText}`,
            statusTextMr: `[डेमो] ${avail.statusTextMr}`,
          }
        : null,
      providerName: this.name,
      source: 'Simulated Demo Queue Stream',
      lastUpdated: new Date().toISOString(),
      isDemo: true,
    };
  }

  public async getHealthSchemes(): Promise<ProviderResponse<HealthSchemeRecord[]>> {
    return {
      success: true,
      data: db.schemes,
      providerName: this.name,
      source: 'Public Schemes Archive (Demo Sandbox)',
      lastUpdated: new Date().toISOString(),
      isDemo: true,
    };
  }

  public async getMedicineStock(facilityId?: string): Promise<ProviderResponse<MedicineStockRecord[]>> {
    return {
      success: true,
      data: db.medicineStocks,
      providerName: this.name,
      source: 'Simulated Drug Warehouse Stock Feed',
      lastUpdated: new Date().toISOString(),
      isDemo: true,
    };
  }

  public async getHealthCamps(district?: string): Promise<ProviderResponse<HealthCampRecord[]>> {
    return {
      success: true,
      data: db.healthCamps,
      providerName: this.name,
      source: 'Simulated Outreach Camp Schedule',
      lastUpdated: new Date().toISOString(),
      isDemo: true,
    };
  }
}
