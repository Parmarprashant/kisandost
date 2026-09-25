/**
 * GET /api/crops/[id]/weather/history
 *
 * Returns historical daily weather for a specific crop's field.
 *
 * Flow:
 *   JWT authentication
 *   → Crop ownership verification
 *   → Field coordinates from crop.fieldId
 *   → Historical weather service (cache-first)
 *   → Normalized response
 *
 * Query parameters:
 *   startDate  — "YYYY-MM-DD" (defaults to crop sowing date if omitted)
 *   endDate    — "YYYY-MM-DD" (defaults to today if omitted)
 *
 * Response:
 * {
 *   cropId, fieldId, startDate, endDate,
 *   observations: NormalizedDailyWeather[],
 *   coverage: WeatherCoverageReport,
 *   fetchedFromProvider: number,
 *   loadedFromCache: number
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Crop } from '@/models/Crop';
import { Field } from '@/models/Field';
import { getHistoricalWeather } from '@/lib/weather/historicalWeatherService';
import { validateDateString } from '@/lib/weather/weatherProvider';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cropId = params.id;
    if (!cropId) {
      return NextResponse.json({ error: 'cropId is required' }, { status: 400 });
    }

    await connectDB();

    // 2. Verify crop ownership
    const crop = await Crop.findOne({ _id: cropId, farmerId: userId }).lean();
    if (!crop) {
      return NextResponse.json(
        { error: 'Crop not found or access denied' },
        { status: 404 }
      );
    }

    // 3. Load associated field for coordinates
    const field = await Field.findById(crop.fieldId).lean();
    if (!field) {
      return NextResponse.json(
        { error: `Associated field not found for crop ${cropId}` },
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

    // 4. Parse date parameters
    const qParams = req.nextUrl.searchParams;
    const today = new Date().toISOString().slice(0, 10);
    const sowingDateStr = new Date(crop.sowingDate).toISOString().slice(0, 10);

    const startDate = qParams.get('startDate') || sowingDateStr;
    const endDate = qParams.get('endDate') || today;

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

    // 5. Fetch historical weather (cache-first)
    const result = await getHistoricalWeather({
      latitude: lat,
      longitude: lon,
      startDate,
      endDate,
      fieldId: crop.fieldId.toString(),
    });

    return NextResponse.json({
      cropId,
      fieldId: crop.fieldId.toString(),
      cropName: crop.cropName,
      sowingDate: sowingDateStr,
      latitude: lat,
      longitude: lon,
      startDate,
      endDate,
      observations: result.observations,
      coverage: result.coverage,
      fetchedFromProvider: result.fetchedFromProvider,
      loadedFromCache: result.loadedFromCache,
    });
  } catch (err: any) {
    const message = err?.message || 'Failed to retrieve crop weather history';
    console.error('[GET /api/crops/[id]/weather/history]', message);

    if (message.includes('Invalid request') || message.includes('exceeds maximum')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
