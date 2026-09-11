import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat or lon" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          "User-Agent": "KisanDost_AgriApp/1.0",
          "Accept-Language": "en"
        }
      }
    );

    if (!res.ok) {
      throw new Error(`OSM API error: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Geocoding fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
