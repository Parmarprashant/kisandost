/**
 * GET /api/weather/historical
 *
 * Returns historical daily weather observations for a location.
 *
 * Query parameters:
 *   latitude    — decimal degrees (-90 to 90)
 *   longitude   — decimal degrees (-180 to 180)
 *   startDate   — "YYYY-MM-DD"
 *   endDate     — "YYYY-MM-DD"
 *   fieldId     — optional; if supplied, verifies ownership and uses field coordinates
 *
 * Security:
 * - Requires valid JWT authentication
 * - If fieldId supplied: validates farmer owns that field, uses field coordinates
 * - If only coordinates supplied: validates they match a registered field of the farmer
 *
 * Response:
 * {
 *   observations: NormalizedDailyWeather[],
 *   coverage: WeatherCoverageReport,
 *   fetchedFromProvider: number,
 *   loadedFromCache: number
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Field } from '@/models/Field';
import { getHistoricalWeather } from '@/lib/weather/historicalWeatherService';
import {
  validateCoordinates,
  validateDateString,
  roundCoordinate,
} from '@/lib/weather/weatherProvider';

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse query parameters
    const params = req.nextUrl.searchParams;
    const latStr = params.get('latitude');
    const lonStr = params.get('longitude');
    const startDate = params.get('startDate');
    const endDate = params.get('endDate');
    const fieldIdParam = params.get('fieldId');

    // 3. Validate date parameters (always required)
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const startCheck = validateDateString(startDate);
    if (!startCheck.valid) {
      return NextResponse.json(
        { error: `Invalid startDate: ${startCheck.error}` },
        { status: 400 }
      );
    }

    const endCheck = validateDateString(endDate);
    if (!endCheck.valid) {
      return NextResponse.json(
        { error: `Invalid endDate: ${endCheck.error}` },
        { status: 400 }
      );
    }

    await connectDB();

    let latitude: number;
    let longitude: number;
    let resolvedFieldId: string | null = null;

    if (fieldIdParam) {
      // 4a. Field-scoped: verify ownership and read coordinates from field
      const field = await Field.findOne({ _id: fieldIdParam, farmerId: userId }).lean();
      if (!field) {
        return NextResponse.json(
          { error: 'Field not found or access denied' },
          { status: 404 }
        );
      }

      const lat = field.location?.latitude;
      const lon = field.location?.longitude;

      if (lat == null || lon == null || !Number.isFinite(lat) || !Number.isFinite(lon)) {
        return NextResponse.json(
          {
            error:
              'Field does not have valid GPS coordinates. Please update the field location first.',
          },
          { status: 422 }
        );
      }

      latitude = lat;
      longitude = lon;
      resolvedFieldId = (field._id as any).toString();
    } else {
      // 4b. Coordinate request: must match a registered field (prevents arbitrary harvesting)
      if (!latStr || !lonStr) {
        return NextResponse.json(
          { error: 'Either fieldId or both latitude and longitude are required' },
          { status: 400 }
        );
      }

      latitude = Number(latStr);
      longitude = Number(lonStr);

      const coordCheck = validateCoordinates(latitude, longitude);
      if (!coordCheck.valid) {
        return NextResponse.json({ error: coordCheck.error }, { status: 400 });
      }

      // Verify coordinates match a registered field
      const latRounded = roundCoordinate(latitude);
      const lonRounded = roundCoordinate(longitude);

      const fields = await Field.find({ farmerId: userId }).lean();
      const matchingField = fields.find((f) => {
        if (f.location?.latitude == null || f.location?.longitude == null) return false;
        return (
          roundCoordinate(f.location.latitude) === latRounded &&
          roundCoordinate(f.location.longitude) === lonRounded
        );
      });

      if (!matchingField) {
        return NextResponse.json(
          {
            error:
              'Coordinates do not match any of your registered fields. Supply fieldId or use your field coordinates.',
          },
          { status: 403 }
        );
      }

      resolvedFieldId = (matchingField._id as any).toString();
    }

    // 5. Fetch historical weather (cache-first)
    const result = await getHistoricalWeather({
      latitude,
      longitude,
      startDate,
      endDate,
      fieldId: resolvedFieldId,
    });

    return NextResponse.json({
      latitude,
      longitude,
      startDate,
      endDate,
      observations: result.observations,
      coverage: result.coverage,
      fetchedFromProvider: result.fetchedFromProvider,
      loadedFromCache: result.loadedFromCache,
    });
  } catch (err: any) {
    const message = err?.message || 'Failed to retrieve historical weather';
    console.error('[GET /api/weather/historical]', message);

    if (message.includes('Invalid request') || message.includes('exceeds maximum')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
