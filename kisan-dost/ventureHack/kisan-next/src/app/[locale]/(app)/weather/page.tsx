"use client";

import { useState, useEffect } from "react";
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CloudRain,
  Search,
  Loader2,
  MapPin,
  Wind,
  Droplets,
  Gauge,
  Sun,
  Cloud,
  Thermometer,
  Eye,
  LocateFixed,
  AlertTriangle,
} from "lucide-react";
import { useWeather, WeatherData, ForecastDay } from "@/context/WeatherContext";

function StatCard({
  icon: Icon,
  label,
  value,
  isDay,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  isDay: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl px-4 py-4 border ${
        isDay
          ? "bg-white/30 border-green-200/40 backdrop-blur-sm"
          : "bg-white/5 border-white/10 backdrop-blur-sm"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isDay ? "bg-green-100/60" : "bg-white/10"
        }`}
      >
        <Icon
          className={`w-4 h-4 ${isDay ? "text-green-700" : "text-green-300"}`}
        />
      </div>
      <div>
        <p
          className={`text-[10px] uppercase tracking-widest font-semibold ${
            isDay ? "text-green-700/70" : "text-green-300/70"
          }`}
        >
          {label}
        </p>
        <p
          className={`text-sm font-bold mt-0.5 ${
            isDay ? "text-green-900" : "text-white"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function ForecastCard({
  day,
  isDay,
  t,
}: {
  day: ForecastDay;
  isDay: boolean;
  t: (key: string) => string;
}) {
  const date = new Date(day.date);
  const dateStr = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div
      className={`flex flex-col gap-2.5 rounded-2xl px-4 py-4 border flex-1 min-w-0 ${
        isDay
          ? "bg-white/20 border-green-200/40 backdrop-blur-sm"
          : "bg-white/5 border-white/10 backdrop-blur-sm"
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-widest ${
          isDay ? "text-green-700/70" : "text-green-300/70"
        }`}
      >
        {dateStr}
      </p>

      {/* Weather condition icon and text */}
      <div className="flex items-center gap-2 mt-1">
        <img
          src={`https:${day.day.condition.icon}`}
          alt={day.day.condition.text}
          className="w-8 h-8 object-contain"
        />
        <div className="min-w-0">
          <p
            className={`text-xs font-medium capitalize line-clamp-1 ${
              isDay ? "text-green-900" : "text-white"
            }`}
          >
            {day.day.condition.text}
          </p>
        </div>
      </div>

      {/* Temperature range */}
      <div className="mt-2">
        <p
          className={`text-sm font-bold ${
            isDay ? "text-green-900" : "text-white"
          }`}
        >
          {Math.round(day.day.maxtemp_c)}°
          <span
            className={`text-xs ml-1 ${
              isDay ? "text-green-700/70" : "text-green-300/70"
            }`}
          >
            {Math.round(day.day.mintemp_c)}°
          </span>
        </p>
      </div>

      {/* Extra details */}
      <div
        className={`text-[11px] space-y-1 mt-2 pt-2 border-t ${
          isDay ? "border-green-300/30 text-green-800/70" : "border-white/10 text-green-300/70"
        }`}
      >
        <div className="flex justify-between">
          <span>{t("humidity")}:</span>
          <span className="font-semibold">{Math.round(day.day.avghumidity)}%</span>
        </div>
        <div className="flex justify-between">
          <span>{t("rain")}:</span>
          <span className="font-semibold">{day.day.chance_of_rain}%</span>
        </div>
      </div>
    </div>
  );
}

export default function WeatherPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const t = useTranslations("WeatherPage");

  const {
    weatherData: ctxData,
    forecast: ctxForecast,
    loading: ctxLoading,
    error: ctxError,
    permissionDenied,
    fetchByQuery,
    refetch,
  } = useWeather();

  const [searchInput, setSearchInput] = useState("");
  const [localData, setLocalData] = useState<WeatherData | null>(null);
  const [localForecast, setLocalForecast] = useState<any[]|null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/auth");
    }
  }, [isLoaded, isSignedIn, router]);

  // Sync context data with local state
  useEffect(() => {
    if (ctxData && !localData) {
      setLocalData(ctxData);
      setSearchInput(ctxData.location.name);
    }
    if (ctxError) {
      setError(ctxError);
    }
  }, [ctxData, ctxError, localData]);

  // Sync context forecast with local state
  useEffect(() => {
    if (ctxForecast) {
      setLocalForecast(ctxForecast);
    }
  }, [ctxForecast]);

  const fetchWeather = async (q: string) => {
    if (!q.trim()) return;
    setLocalLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weather?q=${encodeURIComponent(q.trim())}`);
      const json = await res.json();
      if (!res.ok) {
        const errorMsg = json.error || `HTTP ${res.status}: Failed to fetch weather`;
        setError(errorMsg);
        setLocalData(null);
        setLocalForecast(null);
        return;
      }
      // Extract data
      if (json.location && json.current) {
        const weatherData: WeatherData = {
          location: json.location,
          current: json.current,
        };
        setLocalData(weatherData);
        setLocalForecast(json.forecast?.forecastday || null);
        setError(null);
      } else {
        setError(t("failedFetch"));
        setLocalData(null);
        setLocalForecast(null);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`Unable to fetch weather: ${errorMsg}`);
      setLocalData(null);
      setLocalForecast(null);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather(searchInput);
  };

  const handleUseLocation = () => {
    setGpsLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const q = `${pos.coords.latitude},${pos.coords.longitude}`;
        const result = await fetchByQuery(q);
        if (result && result.location && result.current) {
          const weatherData: WeatherData = {
            location: result.location,
            current: result.current,
          };
          setLocalData(weatherData);
          setLocalForecast(result.forecast?.forecastday || null);
          setSearchInput(result.location.name);
          setError(null);
        } else {
          setError(t("failedFetch"));
        }
        setGpsLoading(false);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setError(t("locationDeniedDesc"));
        } else {
          setError(`Unable to get location: ${error.message}`);
        }
        setGpsLoading(false);
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  };

  const data = localData;
  const loading = localLoading;
  const forecast = localForecast;
  const isDay = data?.current?.is_day === 1;
  const isInitialLoading = ctxLoading && !data;

  const uvLabel =
    data?.current.uv !== undefined
      ? data.current.uv <= 2
        ? t("uvLow")
        : data.current.uv <= 5
        ? t("uvModerate")
        : data.current.uv <= 7
        ? t("uvHigh")
        : t("uvVeryHigh")
      : "";

  return (
    <div className="min-h-[60vh] pb-16 max-w-2xl mx-auto">
      {/* Page heading */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <CloudRain className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      {/* Location denied banner */}
      {permissionDenied && !data && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-5 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
          <div>
            <p className="font-semibold">{t("locationDeniedTitle")}</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {t("locationDeniedDesc")}
            </p>
          </div>
        </div>
      )}

      {/* Search bar */}
      <form
        onSubmit={handleSearch}
        className="flex gap-2 rounded-2xl bg-card border border-border p-2 mb-6 shadow-sm"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-11 pl-10 rounded-xl bg-background border-border/50 focus-visible:ring-primary/40 text-sm"
            disabled={loading || gpsLoading}
          />
        </div>

        {/* Use my location button */}
        <button
          type="button"
          onClick={handleUseLocation}
          disabled={loading || gpsLoading}
          title={t("useMyLocationTitle")}
          className="h-11 w-11 flex items-center justify-center rounded-xl bg-primary/10 hover:bg-primary/20 border border-border/30 text-primary transition-colors shrink-0 disabled:opacity-50"
        >
          {gpsLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LocateFixed className="w-4 h-4" />
          )}
        </button>

        <Button
          type="submit"
          disabled={loading || gpsLoading}
          className="h-11 px-5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Search className="w-4 h-4 mr-1.5" />
              {t("searchBtn")}
            </>
          )}
        </Button>
      </form>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive mb-6 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
          {error}
        </div>
      )}

      {/* Context-loading skeleton (GPS in progress) */}
      {isInitialLoading && (
        <div className="rounded-3xl border border-border bg-card p-8 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <LocateFixed className="w-7 h-7 text-primary animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {t("detectingLocation")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("allowLocation")}
            </p>
          </div>
          <button
            onClick={() => setSearchInput("")}
            className="text-xs text-primary hover:underline"
          >
            {t("searchManually")}
          </button>
        </div>
      )}

      {/* Manual search loading */}
      {loading && !data && (
        <div className="rounded-3xl border border-border bg-card p-8 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {t("fetchingWeather")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("gettingConditions")}
            </p>
          </div>
        </div>
      )}

      {/* Weather card */}
      {data && !loading && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
          {/* Hero */}
          <div
            className={`relative overflow-hidden rounded-3xl border ${
              isDay
                ? "bg-gradient-to-br from-green-300 via-emerald-200 to-lime-100 border-green-300/40"
                : "bg-gradient-to-br from-green-950 via-emerald-900 to-teal-950 border-green-800/30"
            }`}
          >
            {/* Decorative circles */}
            <div
              className={`absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20 ${
                isDay ? "bg-green-400" : "bg-emerald-600"
              }`}
            />
            <div
              className={`absolute -bottom-6 -left-6 w-32 h-32 rounded-full opacity-10 ${
                isDay ? "bg-lime-400" : "bg-teal-600"
              }`}
            />

            {/* Top info row */}
            <div className="relative px-6 pt-6 flex items-start justify-between gap-4">
              <div>
                <p
                  className={`flex items-center gap-1.5 text-sm font-semibold ${
                    isDay ? "text-green-900" : "text-green-100"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {data.location.name}
                  {data.location.region && `, ${data.location.region}`}
                  <span className="opacity-60 font-normal">
                    · {data.location.country}
                  </span>
                </p>
                <p
                  className={`text-xs mt-0.5 font-mono opacity-50 ${
                    isDay ? "text-green-900" : "text-white"
                  }`}
                >
                  {data.location.localtime}
                </p>
              </div>

              {/* Condition icon */}
              <div
                className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center ${
                  isDay
                    ? "bg-white/40 backdrop-blur-sm"
                    : "bg-white/10 backdrop-blur-sm"
                }`}
              >
                <img
                  src={`https:${data.current.condition.icon}`}
                  alt={data.current.condition.text}
                  className="w-12 h-12 object-contain drop-shadow-sm"
                />
              </div>
            </div>

            {/* Temperature block */}
            <div className="relative px-6 pt-4 pb-2">
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-7xl font-extralight tabular-nums tracking-tighter ${
                    isDay ? "text-green-900" : "text-white"
                  }`}
                >
                  {Math.round(data.current.temp_c)}
                </span>
                <span
                  className={`text-3xl font-semibold ${
                    isDay ? "text-green-800/80" : "text-green-200/80"
                  }`}
                >
                  °C
                </span>
              </div>
              <p
                className={`text-base capitalize font-medium mt-1 ${
                  isDay ? "text-green-800/90" : "text-green-100/90"
                }`}
              >
                {data.current.condition.text}
              </p>
              <p
                className={`flex items-center gap-1.5 text-sm mt-1 mb-5 ${
                  isDay ? "text-green-700/70" : "text-green-300/70"
                }`}
              >
                <Thermometer className="w-3.5 h-3.5" />
                {t("feelsLike")} {Math.round(data.current.feelslike_c)}°C
              </p>
            </div>

            {/* Stats grid */}
            <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-2.5 px-4 pb-5">
              <StatCard
                icon={Droplets}
                label={t("humidity")}
                value={`${data.current.humidity}%`}
                isDay={isDay}
              />
              <StatCard
                icon={Wind}
                label={t("wind")}
                value={`${data.current.wind_kph} km/h ${data.current.wind_dir}`}
                isDay={isDay}
              />
              <StatCard
                icon={Gauge}
                label={t("pressure")}
                value={`${data.current.pressure_mb} mb`}
                isDay={isDay}
              />
              <StatCard
                icon={Eye}
                label={t("visibility")}
                value={`${data.current.vis_km} km`}
                isDay={isDay}
              />
            </div>
          </div>

          {/* Extra info row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-card px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Sun className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  {t("uvIndex")}
                </p>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {data.current.uv}{" "}
                  <span className="text-muted-foreground font-normal text-xs">
                    {uvLabel}
                  </span>
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Wind className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  {t("gustSpeed")}
                </p>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {data.current.gust_kph}{" "}
                  <span className="text-muted-foreground font-normal text-xs">
                    km/h
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Cloud cover bar */}
          <div className="rounded-2xl border border-border bg-card px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Cloud className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  {t("cloudCover")}
                </p>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {data.current.cloud}%
                </p>
              </div>
            </div>
            <div className="flex-1 max-w-[160px]">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${data.current.cloud}%` }}
                />
              </div>
            </div>
          </div>

          {/* 5-Day Forecast */}
          {forecast && forecast.length > 0 && (
            <div className="space-y-3 mt-6 pt-6 border-t">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CloudRain className="w-3.5 h-3.5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  5-Day Forecast
                </h3>
              </div>
              <div className="grid grid-cols-5 gap-2 overflow-x-auto pb-2">
                {forecast.slice(0, 5).map((day, idx) => (
                  <ForecastCard key={idx} day={day} isDay={isDay} t={t} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!data && !loading && !isInitialLoading && !error && (
        <div className="rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-20 text-center">
          <div className="inline-flex rounded-2xl bg-primary/10 p-5 mb-5">
            <CloudRain className="w-10 h-10 text-primary" />
          </div>
          <p className="text-base font-semibold text-foreground">
            {t("noLocationTitle")}
          </p>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto leading-relaxed">
            {t("noLocationDesc")}
          </p>
          <button
            type="button"
            onClick={handleUseLocation}
            disabled={gpsLoading}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            {gpsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LocateFixed className="w-4 h-4" />
            )}
            {t("useMyLocation")}
          </button>
        </div>
      )}
    </div>
  );
}
