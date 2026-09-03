export interface GeoLocationResult {
  name: string;
  nameMr: string;
  lat: number;
  lng: number;
  type: 'village' | 'taluka' | 'district' | 'city' | 'pincode';
  district: string;
  taluka?: string;
  pinCode?: string;
  source: string;
}

// Haversine Distance Formula in Kilometers
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Number(distance.toFixed(1));
}

// Verified Maharashtra Administrative Geographic Reference Table
const MAHARASHTRA_GEO_REGISTRY: GeoLocationResult[] = [
  {
    name: 'Ramtek',
    nameMr: 'रामटेक',
    lat: 21.3966,
    lng: 79.3274,
    type: 'taluka',
    district: 'Nagpur',
    taluka: 'Ramtek',
    pinCode: '441106',
    source: 'Survey of India / MahaGIS Administrative Boundary',
  },
  {
    name: 'Mansar',
    nameMr: 'मानसर',
    lat: 21.378,
    lng: 79.289,
    type: 'village',
    district: 'Nagpur',
    taluka: 'Ramtek',
    pinCode: '441106',
    source: 'Maharashtra Village Directory',
  },
  {
    name: 'Katol',
    nameMr: 'काटोल',
    lat: 21.2721,
    lng: 78.5867,
    type: 'taluka',
    district: 'Nagpur',
    taluka: 'Katol',
    pinCode: '441302',
    source: 'Survey of India / MahaGIS',
  },
  {
    name: 'Saoner',
    nameMr: 'सावनेर',
    lat: 21.3857,
    lng: 78.9189,
    type: 'taluka',
    district: 'Nagpur',
    taluka: 'Saoner',
    pinCode: '441107',
    source: 'Survey of India / MahaGIS',
  },
  {
    name: 'Umred',
    nameMr: 'उमरेड',
    lat: 20.8544,
    lng: 79.3274,
    type: 'taluka',
    district: 'Nagpur',
    taluka: 'Umred',
    pinCode: '441203',
    source: 'Survey of India / MahaGIS',
  },
  {
    name: 'Nagpur',
    nameMr: 'नागपूर',
    lat: 21.1458,
    lng: 79.0882,
    type: 'district',
    district: 'Nagpur',
    pinCode: '440001',
    source: 'MahaGIS District HQ Registry',
  },
  {
    name: 'Wardha',
    nameMr: 'वर्धा',
    lat: 20.7453,
    lng: 78.6022,
    type: 'district',
    district: 'Wardha',
    pinCode: '442001',
    source: 'MahaGIS District HQ Registry',
  },
  {
    name: 'Bhamragad',
    nameMr: 'भामरागड',
    lat: 19.3789,
    lng: 80.354,
    type: 'taluka',
    district: 'Gadchiroli',
    taluka: 'Bhamragad',
    pinCode: '442710',
    source: 'Tribal Sub-Plan Zone GIS Reference',
  },
  {
    name: 'Gadchiroli',
    nameMr: 'गडचिरोली',
    lat: 20.1809,
    lng: 79.9936,
    type: 'district',
    district: 'Gadchiroli',
    pinCode: '442605',
    source: 'MahaGIS District HQ Registry',
  },
  {
    name: 'Trimbakeshwar',
    nameMr: 'त्र्यंबकेश्वर',
    lat: 19.9324,
    lng: 73.5307,
    type: 'taluka',
    district: 'Nashik',
    taluka: 'Trimbakeshwar',
    pinCode: '422212',
    source: 'Survey of India / MahaGIS',
  },
  {
    name: 'Nashik',
    nameMr: 'नाशिक',
    lat: 19.9975,
    lng: 73.7898,
    type: 'district',
    district: 'Nashik',
    pinCode: '422001',
    source: 'MahaGIS District HQ Registry',
  },
  {
    name: 'Pune',
    nameMr: 'पुणे',
    lat: 18.5204,
    lng: 73.8567,
    type: 'district',
    district: 'Pune',
    pinCode: '411001',
    source: 'MahaGIS District HQ Registry',
  },
  {
    name: 'Amravati',
    nameMr: 'अमरावती',
    lat: 20.9374,
    lng: 77.7796,
    type: 'district',
    district: 'Amravati',
    pinCode: '444601',
    source: 'MahaGIS District HQ Registry',
  },
  {
    name: 'Chandrapur',
    nameMr: 'चंद्रपूर',
    lat: 19.9615,
    lng: 79.2961,
    type: 'district',
    district: 'Chandrapur',
    pinCode: '442401',
    source: 'MahaGIS District HQ Registry',
  },
  {
    name: '441106',
    nameMr: '४४११०६ (रामटेक)',
    lat: 21.3966,
    lng: 79.3274,
    type: 'pincode',
    district: 'Nagpur',
    taluka: 'Ramtek',
    pinCode: '441106',
    source: 'India Post PIN Code Registry',
  },
  {
    name: '441302',
    nameMr: '४४१३०२ (काटोल)',
    lat: 21.2721,
    lng: 78.5867,
    type: 'pincode',
    district: 'Nagpur',
    taluka: 'Katol',
    pinCode: '441302',
    source: 'India Post PIN Code Registry',
  },
  {
    name: '442710',
    nameMr: '४४२७१० (भामरागड)',
    lat: 19.3789,
    lng: 80.354,
    type: 'pincode',
    district: 'Gadchiroli',
    taluka: 'Bhamragad',
    pinCode: '442710',
    source: 'India Post PIN Code Registry',
  }
];

export async function searchLocations(query: string): Promise<GeoLocationResult[]> {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) return MAHARASHTRA_GEO_REGISTRY.slice(0, 8);

  // 1. First search in verified Maharashtra administrative database
  const localMatches = MAHARASHTRA_GEO_REGISTRY.filter((item) => {
    return (
      item.name.toLowerCase().includes(cleanQ) ||
      item.nameMr.toLowerCase().includes(cleanQ) ||
      item.district.toLowerCase().includes(cleanQ) ||
      (item.taluka && item.taluka.toLowerCase().includes(cleanQ)) ||
      (item.pinCode && item.pinCode.includes(cleanQ))
    );
  });

  if (localMatches.length > 0) {
    return localMatches;
  }

  // 2. Fallback to OpenStreetMap Nominatim Geocoder for dynamic search
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query + ', Maharashtra, India'
    )}&format=json&addressdetails=1&limit=5`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'GramAarogya-Healthcare-App/2.0',
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          name: item.display_name.split(',')[0],
          nameMr: item.display_name.split(',')[0],
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.type === 'village' ? 'village' : 'city',
          district: item.address?.state_district || item.address?.county || 'Maharashtra',
          taluka: item.address?.suburb || item.address?.county,
          pinCode: item.address?.postcode,
          source: 'OpenStreetMap Nominatim Geocoding API',
        }));
      }
    }
  } catch {
    // If external geocoder fails, return default matches
  }

  return MAHARASHTRA_GEO_REGISTRY.slice(0, 5);
}
