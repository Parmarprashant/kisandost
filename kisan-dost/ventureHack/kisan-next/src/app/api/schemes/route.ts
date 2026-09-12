import { NextResponse } from 'next/server';
import {
  GOVERNMENT_SCHEMES,
  SCHEME_CATEGORIES,
  filterSchemes,
} from '@/lib/schemes/governmentSchemes';

/**
 * Government schemes for farmers.
 *
 * Serves the curated catalogue in src/lib/schemes/governmentSchemes.ts. When
 * the API Setu myScheme collection becomes available in sandbox, fetch it here
 * and map it onto the GovScheme shape — the UI reads this route only, so no
 * component needs to change.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') ?? undefined;
    const category = searchParams.get('category') ?? undefined;

    const schemes = filterSchemes(GOVERNMENT_SCHEMES, { query, category });

    return NextResponse.json({
      schemes,
      categories: SCHEME_CATEGORIES,
      total: schemes.length,
      source: 'curated',
    });
  } catch (error) {
    console.error('GET /api/schemes error:', error);
    return NextResponse.json(
      { error: 'Failed to load government schemes' },
      { status: 500 }
    );
  }
}
