import { NextRequest, NextResponse } from "next/server";

const WEATHER_API_BASE = "https://api.weatherapi.com/v1/current.json";
const FORECAST_API_BASE = "https://api.weatherapi.com/v1/forecast.json";

// Helper function to validate environment
function validateEnvironment() {
  const key = process.env.WEATHER_API_KEY;
  if (!key) {
    console.error("[Weather API] WEATHER_API_KEY environment variable not configured");
    return null;
  }
  return key;
}

// Helper function to validate query parameter
function validateQuery(q: unknown): { valid: boolean; error?: string } {
  if (!q || typeof q !== "string" || !q.trim()) {
    return {
      valid: false,
      error: "Missing or invalid query (q). Use city name, 'city,country', or lat,lon",
    };
  }
  return { valid: true };
}

function looksLikeLatLon(q: string): { lat: number; lon: number } | null {
  const parts = q.split(",").map((s) => s.trim());
  if (parts.length !== 2) return null;
  const lat = Number(parts[0]);
  const lon = Number(parts[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}

function mapOpenMeteoWeatherCode(code: number, isDay: number = 1): { text: string; icon: string; code: number } {
  // Map Open-Meteo WMO codes to WeatherAPI icon codes
  let text = "Unknown";
  let iconCode = "113"; // clear default

  if (code === 0) {
    text = "Clear";
    iconCode = "113";
  } else if (code === 1 || code === 2) {
    text = "Partly cloudy";
    iconCode = "116";
  } else if (code === 3) {
    text = "Overcast";
    iconCode = "122";
  } else if (code === 45 || code === 48) {
    text = "Fog";
    iconCode = "143";
  } else if (code >= 51 && code <= 57) {
    text = "Drizzle";
    iconCode = "266";
  } else if (code >= 61 && code <= 67) {
    text = "Rain";
    iconCode = "308";
  } else if (code >= 71 && code <= 77) {
    text = "Snow";
    iconCode = "326";
  } else if (code >= 80 && code <= 82) {
    text = "Rain showers";
    iconCode = "353";
  } else if (code >= 85 && code <= 86) {
    text = "Snow showers";
    iconCode = "368";
  } else if (code >= 95 && code <= 99) {
    text = "Thunderstorm";
    iconCode = "386";
  }

  const time = isDay ? "day" : "night";
  const icon = `//cdn.weatherapi.com/weather/64x64/${time}/${iconCode}.png`;
  return { text, icon, code };
}

async function openMeteoResolveLocation(q: string): Promise<{
  ok: boolean;
  lat?: number;
  lon?: number;
  name?: string;
  region?: string;
  country?: string;
  error?: string;
}> {
  if (q.trim() === "auto:ip") {
    try {
      const res = await fetch("https://ipapi.co/json/", { next: { revalidate: 600 } });
      if (!res.ok) return { ok: false, error: `IP location failed (${res.status})` };
      const j: any = await res.json();
      const lat = Number(j.latitude);
      const lon = Number(j.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return { ok: false, error: "IP location missing coordinates" };
      return {
        ok: true,
        lat,
        lon,
        name: j.city || "Unknown",
        region: j.region || "",
        country: j.country_name || j.country || "",
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  const ll = looksLikeLatLon(q);
  if (ll) {
    try {
      // Reverse geocoding using Open-Meteo (Geocoding API only supports name-to-coord, so we use another free one if possible, or just coordinates as name)
      // Actually, Open-Meteo's geocoding API doesn't support reverse (coord-to-name).
      // We should use BigDataCloud or Nominatim (OpenStreetMap)
      const reverseRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${ll.lat}&longitude=${ll.lon}&localityLanguage=en`);
      if (reverseRes.ok) {
        const reverseData: any = await reverseRes.json();
        return {
          ok: true,
          lat: ll.lat,
          lon: ll.lon,
          name: reverseData.city || reverseData.locality || "Current Location",
          region: reverseData.principalSubdivision || "",
          country: reverseData.countryName || "",
        };
      }
    } catch (e) {
      console.error("[Weather API] Fallback reverse geocoding failed:", e);
    }
    return { ok: true, lat: ll.lat, lon: ll.lon, name: "Current location", region: "", country: "" };
  }

  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", q.trim());
    url.searchParams.set("count", "1");
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");
    const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
    if (!res.ok) return { ok: false, error: `Geocoding failed (${res.status})` };
    const j: any = await res.json();
    const first = j?.results?.[0];
    if (!first) return { ok: false, error: "Location not found" };
    return {
      ok: true,
      lat: Number(first.latitude),
      lon: Number(first.longitude),
      name: first.name || q.trim(),
      region: first.admin1 || "",
      country: first.country || "",
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function getWeatherViaOpenMeteo(q: string): Promise<{ ok: boolean; data: unknown; error?: string }> {
  const loc = await openMeteoResolveLocation(q);
  if (!loc.ok || loc.lat == null || loc.lon == null) {
    return { ok: false, data: null, error: loc.error || "Failed to resolve location" };
  }

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(loc.lat));
    url.searchParams.set("longitude", String(loc.lon));
    url.searchParams.set(
      "current",
      [
        "temperature_2m",
        "relative_humidity_2m",
        "is_day",
        "weather_code",
        "wind_speed_10m",
        "wind_direction_10m",
        "pressure_msl",
        "cloud_cover",
        "visibility",
        "uv_index",
        "precipitation",
      ].join(",")
    );
    url.searchParams.set(
      "daily",
      [
        "temperature_2m_max",
        "temperature_2m_min",
        "temperature_2m_mean",
        "precipitation_probability_max",
        "uv_index_max",
        "weather_code",
      ].join(",")
    );
    url.searchParams.set("forecast_days", "5");
    url.searchParams.set("timezone", "auto");

    const res = await fetch(url.toString(), { next: { revalidate: 600 } });
    if (!res.ok) return { ok: false, data: null, error: `Open-Meteo returned ${res.status}` };
    const j: any = await res.json();

    const c = j.current;
    const condition = mapOpenMeteoWeatherCode(Number(c.weather_code), Number(c.is_day) || 0);
    const localtime = j?.current?.time || new Date().toISOString();

    const weatherResponse = {
      location: {
        name: loc.name || "Unknown",
        region: loc.region || "",
        country: loc.country || "",
        lat: loc.lat,
        lon: loc.lon,
        localtime,
      },
      current: {
        temp_c: Number(c.temperature_2m),
        temp_f: Number(c.temperature_2m) * 9 / 5 + 32,
        is_day: Number(c.is_day) || 0,
        condition,
        wind_kph: Number(c.wind_speed_10m) || 0,
        wind_degree: Number(c.wind_direction_10m) || 0,
        wind_dir: "",
        pressure_mb: Number(c.pressure_msl) || 0,
        humidity: Number(c.relative_humidity_2m) || 0,
        cloud: Number(c.cloud_cover) || 0,
        feelslike_c: Number(c.temperature_2m) || 0,
        vis_km: Number(c.visibility) ? Number(c.visibility) / 1000 : 0,
        uv: Number(c.uv_index) || 0,
        gust_kph: 0,
        precip_mm: Number(c.precipitation) || 0,
      },
      forecast: {
        forecastday: Array.isArray(j?.daily?.time)
          ? j.daily.time.map((date: string, idx: number) => {
              const code = Number(j.daily.weather_code?.[idx] ?? condition.code);
              return {
                date,
                day: {
                  maxtemp_c: Number(j.daily.temperature_2m_max?.[idx] ?? 0),
                  mintemp_c: Number(j.daily.temperature_2m_min?.[idx] ?? 0),
                  avgtemp_c: Number(j.daily.temperature_2m_mean?.[idx] ?? 0),
                  condition: mapOpenMeteoWeatherCode(code),
                  will_it_rain: Number(j.daily.precipitation_probability_max?.[idx] ?? 0) > 30 ? 1 : 0,
                  chance_of_rain: Number(j.daily.precipitation_probability_max?.[idx] ?? 0),
                  will_it_snow: 0,
                  chance_of_snow: 0,
                  avghumidity: Number(c.relative_humidity_2m) || 0,
                  avgvis_km: Number(c.visibility) ? Number(c.visibility) / 1000 : 0,
                  uv: Number(j.daily.uv_index_max?.[idx] ?? 0),
                },
              };
            })
          : [],
      },
      forecastError: null,
    };

    return { ok: true, data: weatherResponse };
  } catch (e) {
    return { ok: false, data: null, error: e instanceof Error ? e.message : String(e) };
  }
}

// Fetch current weather
async function getCurrentWeather(
  q: string,
  key: string
): Promise<{ ok: boolean; data: unknown; error?: string }> {
  try {
    const url = new URL(WEATHER_API_BASE);
    url.searchParams.set("key", key);
    url.searchParams.set("q", q.trim());
    url.searchParams.set("aqi", "yes");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch(url.toString(), {
      signal: controller.signal,
      next: { revalidate: 300 },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        ok: false,
        data: null,
        error: errorData?.error?.message || `API returned status ${res.status}`,
      };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Weather API] Current weather fetch failed:", errorMsg);
    
    if (errorMsg.includes("aborted")) {
      return { ok: false, data: null, error: "Request timeout - please try again" };
    }
    
    return { ok: false, data: null, error: `Failed to fetch weather: ${errorMsg}` };
  }
}

// Fetch forecast
async function getForecast(
  q: string,
  key: string,
  days: number = 5
): Promise<{ ok: boolean; data: unknown; error?: string }> {
  try {
    const url = new URL(FORECAST_API_BASE);
    url.searchParams.set("key", key);
    url.searchParams.set("q", q.trim());
    url.searchParams.set("days", String(days));
    url.searchParams.set("aqi", "yes");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url.toString(), {
      signal: controller.signal,
      next: { revalidate: 600 }, // Cache for longer since forecast changes less frequently
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        ok: false,
        data: null,
        error: errorData?.error?.message || `API returned status ${res.status}`,
      };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Weather API] Forecast fetch failed:", errorMsg);
    
    if (errorMsg.includes("aborted")) {
      return { ok: false, data: null, error: "Request timeout - please try again" };
    }
    
    return { ok: false, data: null, error: `Failed to fetch forecast: ${errorMsg}` };
  }
}

// Main GET handler
export async function GET(req: NextRequest) {
  // Validate query
  const q = req.nextUrl.searchParams.get("q");
  const queryValidation = validateQuery(q);
  if (!queryValidation.valid) {
    return NextResponse.json(
      { error: queryValidation.error },
      { status: 400 }
    );
  }

  // Type guard: q is guaranteed to be a string after validation
  const query = q as string;

  const key = validateEnvironment();
  if (!key) {
    // No key configured: fall back to Open-Meteo (no key required)
    const fallback = await getWeatherViaOpenMeteo(query);
    if (!fallback.ok) {
      return NextResponse.json({ error: fallback.error || "Failed to fetch weather" }, { status: 400 });
    }
    return NextResponse.json(fallback.data);
  }

  // Try WeatherAPI first (better icons + richer fields), but fall back if key is invalid/blocked.
  const [currentResult, forecastResult] = await Promise.all([
    getCurrentWeather(query, key),
    getForecast(query, key, 5),
  ]);

  if (!currentResult.ok) {
    const msg = (currentResult.error || "").toLowerCase();
    const isKeyProblem =
      msg.includes("api key") ||
      msg.includes("invalid") ||
      msg.includes("key") ||
      msg.includes("permission") ||
      msg.includes("access denied");

    console.error("[Weather API] WeatherAPI failed:", currentResult.error, "Fallback:", isKeyProblem);

    if (isKeyProblem) {
      const fallback = await getWeatherViaOpenMeteo(query);
      if (fallback.ok) return NextResponse.json(fallback.data);
    }

    return NextResponse.json(
      { error: currentResult.error || "Failed to fetch current weather" },
      { status: 400 }
    );
  }

  const currentData = currentResult.data as any;
  return NextResponse.json({
    location: currentData.location,
    current: currentData.current,
    forecast: forecastResult.ok ? (forecastResult.data as any).forecast : null,
    forecastError: !forecastResult.ok ? forecastResult.error : null,
  });
}
