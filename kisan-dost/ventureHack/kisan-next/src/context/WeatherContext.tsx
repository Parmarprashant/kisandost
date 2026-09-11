"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

export interface WeatherCondition {
  text: string;
  icon: string;
  code: number;
}

export interface ForecastDay {
  date: string;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    avgtemp_c: number;
    condition: WeatherCondition;
    will_it_rain: number;
    chance_of_rain: number;
    will_it_snow: number;
    chance_of_snow: number;
    avghumidity: number;
    avgvis_km: number;
    uv: number;
  };
  hour?: Array<{
    time: string;
    temp_c: number;
    condition: WeatherCondition;
    humidity: number;
    chance_of_rain: number;
    wind_kph: number;
  }>;
}

export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: WeatherCondition;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    vis_km: number;
    uv: number;
    gust_kph: number;
    precip_mm: number;
  };
}

export interface WeatherResponse {
  location: WeatherData["location"];
  current: WeatherData["current"];
  forecast?: {
    forecastday: ForecastDay[];
  };
  forecastError?: string | null;
}

interface WeatherContextValue {
  weatherData: WeatherData | null;
  forecast: ForecastDay[] | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  locationError: string | null;
  lastUpdated: Date | null;
  refetch: () => void;
  fetchByQuery: (q: string) => Promise<WeatherResponse | null>;
}

const WeatherContext = createContext<WeatherContextValue | null>(null);

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

// Retry logic helper
async function retryFetch(
  url: string,
  options?: RequestInit,
  retries = MAX_RETRIES
): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (retries > 0) {
      console.log(`[Weather API] Retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return retryFetch(url, options, retries - 1);
    }
    throw err;
  }
}

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const queryRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchWeather = useCallback(async (q: string, showLoading = true) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      if (showLoading) setLoading(true);
      setError(null);

      const res = await retryFetch(
        `/api/weather?q=${encodeURIComponent(q)}`,
        { signal: abortControllerRef.current.signal }
      );

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error(
          "[Weather API] Response is not JSON. Status:",
          res.status,
          "Content-Type:",
          contentType,
          "Body start:",
          text.substring(0, 100)
        );
        setError(`API error: ${res.status} - Invalid response format`);
        setWeatherData(null);
        setForecast(null);
        return null;
      }

      const json = await res.json();

      if (!res.ok) {
        const errorMsg = json.error || `HTTP ${res.status}: Failed to fetch weather`;
        console.error("[Weather API]", errorMsg);
        setError(errorMsg);
        setWeatherData(null);
        setForecast(null);
        return null;
      }

      // Extract data from response
      const weatherResponse = json as WeatherResponse;
      if (weatherResponse.location && weatherResponse.current) {
        const weatherData: WeatherData = {
          location: weatherResponse.location,
          current: weatherResponse.current,
        };
        setWeatherData(weatherData);
        setForecast(weatherResponse.forecast?.forecastday || null);
        setLastUpdated(new Date());
        setLocationError(null);
        queryRef.current = q;
        setError(null);
      } else {
        setError("Unexpected response format from weather API");
        setWeatherData(null);
        setForecast(null);
      }
    } catch (err) {
      // Don't log abort errors as they're expected
      if (err instanceof Error && err.name === "AbortError") {
        return null;
      }

      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("[Weather API] Fetch error:", errorMsg);
      setError(`Unable to fetch weather: ${errorMsg}`);
      setWeatherData(null);
      setForecast(null);
    } finally {
      if (showLoading) setLoading(false);
    }

    return null;
  }, []);

  const fetchByQuery = useCallback(
    async (q: string): Promise<WeatherResponse | null> => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        const res = await retryFetch(
          `/api/weather?q=${encodeURIComponent(q)}`,
          { signal: abortControllerRef.current.signal }
        );

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error(
            "[Weather API] fetchByQuery: Response is not JSON. Status:",
            res.status,
            "Body start:",
            text.substring(0, 100)
          );
          return null;
        }

        const json = await res.json();

        if (!res.ok) {
          console.error("[Weather API]", json.error);
          return null;
        }

        const weatherResponse = json as WeatherResponse;
        if (weatherResponse.location && weatherResponse.current) {
          const weatherData: WeatherData = {
            location: weatherResponse.location,
            current: weatherResponse.current,
          };
          setWeatherData(weatherData);
          setForecast(weatherResponse.forecast?.forecastday || null);
          setLastUpdated(new Date());
          queryRef.current = q;
          setError(null);
          return weatherResponse;
        }
        return null;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return null;
        }
        console.error("[Weather API] fetchByQuery error:", err);
        return null;
      }
    },
    []
  );

  /** Fallback: fetch weather by IP when GPS is unavailable */
  const fetchByIp = useCallback(async () => {
    try {
      await fetchWeather("auto:ip", false);
    } catch (err) {
      console.error("[Weather API] IP-based fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchWeather]);

  const doGetPosition = useCallback(() => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const q = `${pos.coords.latitude},${pos.coords.longitude}`;
        fetchWeather(q);
      },
      async () => {
        // GPS denied or failed — fall back to IP-based location silently
        setPermissionDenied(true);
        await fetchByIp();
      },
      { timeout: 10000, maximumAge: 0 }
    );
  }, [fetchWeather, fetchByIp]);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      // No GPS support at all — just use IP
      fetchByIp();
      return;
    }

    setPermissionDenied(false);
    setLocationError(null);

    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((status) => {
          if (status.state === "denied") {
            // Already blocked — go straight to IP fallback
            setPermissionDenied(true);
            fetchByIp();
          } else {
            doGetPosition();
          }

          // Auto-fetch when user re-grants permission in browser settings
          status.onchange = () => {
            if (status.state === "granted") {
              setPermissionDenied(false);
              setLocationError(null);
              doGetPosition();
            } else if (status.state === "denied") {
              setPermissionDenied(true);
              fetchByIp();
            }
          };
        })
        .catch(() => doGetPosition());
    } else {
      doGetPosition();
    }
  }, [doGetPosition, fetchByIp]);

  // On mount
  useEffect(() => {
    if (!navigator.geolocation) {
      fetchByIp();
      return;
    }

    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((status) => {
          if (status.state === "denied") {
            setPermissionDenied(true);
            fetchByIp();
          } else {
            doGetPosition();
          }

          status.onchange = () => {
            if (status.state === "granted") {
              setPermissionDenied(false);
              setLocationError(null);
              doGetPosition();
            } else if (status.state === "denied") {
              setPermissionDenied(true);
              fetchByIp();
            }
          };
        })
        .catch(() => doGetPosition());
    } else {
      doGetPosition();
    }
  }, [doGetPosition, fetchByIp]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (queryRef.current) {
        fetchWeather(queryRef.current, false);
      }
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <WeatherContext.Provider
      value={{
        weatherData,
        forecast,
        loading,
        error,
        permissionDenied,
        locationError,
        lastUpdated,
        refetch: detectLocation,
        fetchByQuery,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error("useWeather must be used within WeatherProvider");
  return ctx;
}
