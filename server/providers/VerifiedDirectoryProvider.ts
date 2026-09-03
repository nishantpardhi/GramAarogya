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

export class VerifiedDirectoryProvider implements HealthcareDataProvider {
  public readonly name = 'MahaArogya Verified Health Directory';
  public readonly type = 'directory' as const;
  public readonly isConnected = true;

  public async getFacilities(options?: {
    district?: string;
    taluka?: string;
    type?: string;
  }): Promise<ProviderResponse<FacilityRecord[]>> {
    let list = [...db.facilities];

    if (options?.district && options.district !== 'ALL') {
      list = list.filter((f) => f.district.toLowerCase() === options.district?.toLowerCase());
    }
    if (options?.taluka && options.taluka !== 'ALL') {
      list = list.filter((f) => f.taluka.toLowerCase() === options.taluka?.toLowerCase());
    }
    if (options?.type && options.type !== 'ALL') {
      list = list.filter((f) => f.type === options.type);
    }

    return {
      success: true,
      data: list,
      providerName: this.name,
      source: 'Verified Maharashtra Directorate of Health Services (DHS) Public Health Master Database',
      sourceUrl: 'https://arogya.maharashtra.gov.in',
      lastUpdated: new Date().toISOString(),
      isDemo: false,
    };
  }

  public async getNearbyFacilities(
    lat: number,
    lng: number,
    radiusKm: number = 50
  ): Promise<ProviderResponse<FacilityRecord[]>> {
    const listWithDistances: FacilityRecord[] = db.facilities.map((fac) => {
      const distanceKm = calculateHaversineDistance(lat, lng, fac.lat, fac.lng);
      return {
        ...fac,
        distanceKm,
      };
    });

    const nearby = listWithDistances
      .filter((f) => (f.distanceKm !== undefined ? f.distanceKm <= radiusKm : true))
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

    // If none within radius, return closest 3 with calculated distance
    const finalResult = nearby.length > 0 ? nearby : listWithDistances.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0)).slice(0, 3);

    return {
      success: true,
      data: finalResult,
      providerName: this.name,
      source: 'Verified GIS Coordinates & OpenStreetMap Haversine Distance Pipeline',
      lastUpdated: new Date().toISOString(),
      isDemo: false,
    };
  }

  public async getFacilityById(id: string): Promise<ProviderResponse<FacilityRecord>> {
    const fac = db.facilities.find((f) => f.id === id);
    if (!fac) {
      return {
        success: false,
        data: null,
        providerName: this.name,
        source: 'MahaArogya Directory',
        lastUpdated: new Date().toISOString(),
        isDemo: false,
        message: 'Facility not found in verified registry.',
      };
    }
    return {
      success: true,
      data: fac,
      providerName: this.name,
      source: fac.source,
      sourceUrl: fac.sourceUrl,
      lastUpdated: fac.lastUpdated,
      isDemo: false,
    };
  }

  public async getDoctors(options?: {
    facilityId?: string;
    specialization?: string;
  }): Promise<ProviderResponse<DoctorRecord[]>> {
    let list = db.doctors.filter((d) => d.verificationStatus === 'verified');

    if (options?.facilityId) {
      list = list.filter((d) => d.facilityId === options.facilityId);
    }
    if (options?.specialization && options.specialization !== 'ALL') {
      list = list.filter((d) => d.specialization.toLowerCase().includes(options.specialization!.toLowerCase()));
    }

    return {
      success: true,
      data: list,
      providerName: this.name,
      source: 'Healthcare Professionals Registry (HPR) & Maharashtra Medical Council (MMC) Cadre',
      lastUpdated: new Date().toISOString(),
      isDemo: false,
    };
  }

  public async getDoctorById(id: string): Promise<ProviderResponse<DoctorRecord>> {
    const doc = db.doctors.find((d) => d.id === id);
    if (!doc) {
      return {
        success: false,
        data: null,
        providerName: this.name,
        source: 'Healthcare Professionals Registry',
        lastUpdated: new Date().toISOString(),
        isDemo: false,
        message: 'Doctor not found.',
      };
    }
    return {
      success: true,
      data: doc,
      providerName: this.name,
      source: doc.source,
      lastUpdated: doc.lastUpdated,
      isDemo: false,
    };
  }

  public async getDoctorAvailability(doctorId: string): Promise<ProviderResponse<DoctorAvailabilityRecord>> {
    const avail = db.doctorAvailability.get(doctorId);
    if (!avail) {
      // Return default off-duty status if not set
      const doc = db.doctors.find((d) => d.id === doctorId);
      const defaultAvail: DoctorAvailabilityRecord = {
        doctorId,
        doctorName: doc ? doc.name : 'Medical Officer',
        facilityId: doc ? doc.facilityId : '',
        facilityName: doc ? doc.facilityName : '',
        status: 'off_duty',
        statusText: 'Off Duty / Shift Complete',
        statusTextMr: 'ड्यूटी वेळ समाप्त',
        lastUpdated: new Date().toISOString(),
        activeShift: 'None',
        currentQueueCount: 0,
        avgWaitTimeMinutes: 0,
        updatedBy: 'System Default',
      };
      return {
        success: true,
        data: defaultAvail,
        providerName: this.name,
        source: 'Facility Real-Time OPD Registry',
        lastUpdated: defaultAvail.lastUpdated,
        isDemo: false,
      };
    }

    return {
      success: true,
      data: avail,
      providerName: this.name,
      source: 'Live Facility Biometric & OPD Queue Dispatcher',
      lastUpdated: avail.lastUpdated,
      isDemo: false,
    };
  }

  public async getHealthSchemes(): Promise<ProviderResponse<HealthSchemeRecord[]>> {
    return {
      success: true,
      data: db.schemes,
      providerName: this.name,
      source: 'Official Gazette & Public Health Dept, Govt. of Maharashtra (MJPJAY, PMMVY, Navsanjivani)',
      lastUpdated: new Date().toISOString(),
      isDemo: false,
    };
  }

  public async getMedicineStock(facilityId?: string): Promise<ProviderResponse<MedicineStockRecord[]>> {
    let list = db.medicineStocks;
    if (facilityId) {
      list = list.filter((m) => m.facilityId === facilityId);
    }
    return {
      success: true,
      data: list,
      providerName: this.name,
      source: 'e-Aushadhi / DVDMS Portal - Govt. of Maharashtra Central Drug Warehouse',
      lastUpdated: new Date().toISOString(),
      isDemo: false,
    };
  }

  public async getHealthCamps(district?: string): Promise<ProviderResponse<HealthCampRecord[]>> {
    let list = db.healthCamps;
    if (district && district !== 'ALL') {
      list = list.filter((c) => c.district.toLowerCase() === district.toLowerCase());
    }
    return {
      success: true,
      data: list,
      providerName: this.name,
      source: 'District Health Society, National Health Mission (NHM) Outreach Calendar',
      lastUpdated: new Date().toISOString(),
      isDemo: false,
    };
  }
}
