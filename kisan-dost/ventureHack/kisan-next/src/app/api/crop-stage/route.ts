import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    daysAfterSowing: 0,
    currentStage: 'Active',
    currentAdvisory: null,
    nextAdvisory: null,
  }, { status: 200 });
}
