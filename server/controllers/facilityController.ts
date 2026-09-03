import { Request, Response } from 'express';
import { Facility } from '../models/Facility';
import { db } from '../db/store';
import { providerManager } from '../providers';
import { calculateHaversineDistance } from '../services/locationService';

export const getFacilities = async (req: Request, res: Response) => {
  try {
    const { district, taluka, type } = req.query as Record<string, string>;

    try {
      const query: any = {};
      if (district && district !== 'All Districts' && district !== 'सर्व जिल्हे') {
        query.district = { $regex: new RegExp(district, 'i') };
      }
      if (taluka && taluka !== 'All Talukas' && taluka !== 'सर्व तालुके') {
        query.taluka = { $regex: new RegExp(taluka, 'i') };
      }
      if (type && type !== 'All Types' && type !== 'सर्व प्रकार') {
        query.type = type;
      }

      const mongoFacilities = await Facility.find(query);
      if (mongoFacilities.length > 0) {
        return res.json({
          success: true,
          count: mongoFacilities.length,
          source: 'MongoDB Atlas - Maharashtra Government Health Facility Registry (HFR)',
          data: mongoFacilities,
        });
      }
    } catch {
      // Fallback to active provider
    }

    const provider = providerManager.getActiveProvider();
    const result = await provider.getFacilities({ district, taluka, type });

    return res.json({
      success: true,
      count: result.data.length,
      source: result.source,
      sourceUrl: result.sourceUrl,
      lastUpdated: result.lastUpdated,
      isDemo: result.isDemo,
      provider: provider.name,
      data: result.data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch facilities',
      data: [],
    });
  }
};

export const getNearbyFacilities = async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);
    const radiusKm = parseFloat(radius as string);

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({
        success: false,
        error: 'Valid lat and lng query parameters are required',
      });
    }

    const provider = providerManager.getActiveProvider();
    const all = await provider.getFacilities({});

    const withDistance = all.data.map((fac) => {
      const dist = calculateHaversineDistance(userLat, userLng, fac.lat, fac.lng);
      return { ...fac, distanceKm: dist };
    });

    const nearby = withDistance
      .filter((fac) => fac.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return res.json({
      success: true,
      count: nearby.length,
      userLocation: { lat: userLat, lng: userLng },
      radiusKm,
      data: nearby,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Nearby facilities search failed',
      data: [],
    });
  }
};

export const getFacilityById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const provider = providerManager.getActiveProvider();
    const facility = await provider.getFacilityById(id);

    if (!facility) {
      return res.status(404).json({
        success: false,
        error: `Facility with ID '${id}' not found.`,
      });
    }

    return res.json({
      success: true,
      data: facility,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
