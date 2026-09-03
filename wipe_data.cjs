const fs = require('fs');
const file = 'src/data/maharashtraData.ts';

const data = `import { Facility, Doctor, Appointment, MedicineStock, HealthCamp, GovernmentScheme, UserProfile, HealthRecord, Prescription, Referral } from '../types';

export const INITIAL_FACILITIES: Facility[] = [];
export const INITIAL_DOCTORS: Doctor[] = [];
export const INITIAL_APPOINTMENTS: Appointment[] = [];
export const INITIAL_PRESCRIPTIONS: Prescription[] = [];
export const INITIAL_REFERRALS: Referral[] = [];
export const INITIAL_HEALTH_RECORDS: HealthRecord[] = [];
export const INITIAL_MEDICINE_STOCKS: MedicineStock[] = [];
export const INITIAL_HEALTH_CAMPS: HealthCamp[] = [];
export const INITIAL_SCHEMES: GovernmentScheme[] = [];
`;

fs.writeFileSync(file, data);
console.log('Wiped demo data');
