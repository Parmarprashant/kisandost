export interface FarmingAdvisory {
  /** 1-2 line brief shown in the notification bar */
  brief: string;
  /** Emoji icon that reflects the advisory tone */
  icon: string;
  /** Severity: 'good' | 'caution' | 'warning' */
  severity: "good" | "caution" | "warning";

  // Detailed farming cards for the weather page
  irrigation: { advice: string; status: "needed" | "skip" | "ok" };
  sprayWindow: { advice: string; status: "good" | "avoid" | "limited" };
  diseaseRisk: { advice: string; level: "low" | "moderate" | "high" };
  fieldWork: { advice: string; status: "suitable" | "limited" | "avoid" };
  frostWarning: boolean;
  heatStress: boolean;
}

interface WeatherInput {
  temp_c: number;
  feelslike_c: number;
  humidity: number;
  wind_kph: number;
  cloud: number;
  uv: number;
  vis_km: number;
  is_day: number;
  condition: { text: string; code: number };
}

/** Detect if the condition is rainy */
function isRainy(condition: WeatherInput["condition"]): boolean {
  const rainCodes = [1063, 1066, 1072, 1150, 1153, 1168, 1171, 1180, 1183,
    1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246];
  return rainCodes.includes(condition.code) ||
    condition.text.toLowerCase().includes("rain") ||
    condition.text.toLowerCase().includes("drizzle") ||
    condition.text.toLowerCase().includes("shower");
}

/** Detect thunderstorm */
function isThunder(condition: WeatherInput["condition"]): boolean {
  const codes = [1087, 1273, 1276, 1279, 1282];
  return codes.includes(condition.code) ||
    condition.text.toLowerCase().includes("thunder");
}

export function getFarmingAdvisory(w: WeatherInput): FarmingAdvisory {
  const rainy = isRainy(w.condition);
  const thunder = isThunder(w.condition);
  const frost = w.temp_c < 2;
  const heat = w.temp_c > 38;
  const highWind = w.wind_kph > 25;
  const highHumidity = w.humidity > 80;
  const lowHumidity = w.humidity < 30;

  // ── Brief (1-2 lines for notification bar) ──────────────────────────
  let brief = "";
  let icon = "🌱";
  let severity: FarmingAdvisory["severity"] = "good";

  if (thunder) {
    brief = "⚠️ Thunderstorm alert! Keep livestock sheltered and avoid open fields.";
    icon = "⛈️";
    severity = "warning";
  } else if (frost) {
    brief = "🧊 Frost risk tonight. Cover sensitive crops and protect seedlings.";
    icon = "❄️";
    severity = "warning";
  } else if (heat) {
    brief = "🔥 Severe heat stress. Irrigate early morning, avoid midday field work.";
    icon = "☀️";
    severity = "warning";
  } else if (rainy) {
    brief = "🌧️ Rain today — skip irrigation, delay pesticide spraying.";
    icon = "🌧️";
    severity = "caution";
  } else if (highWind) {
    brief = "💨 Strong winds. Avoid spraying — chemicals may drift to other fields.";
    icon = "🌬️";
    severity = "caution";
  } else if (highHumidity) {
    brief = "💧 High humidity. Check crops for fungal diseases like blight or mold.";
    icon = "🍄";
    severity = "caution";
  } else if (lowHumidity && w.temp_c > 30) {
    brief = "🌵 Hot & dry conditions. Increase irrigation frequency for crops.";
    icon = "🌡️";
    severity = "caution";
  } else if (w.temp_c >= 20 && w.temp_c <= 30 && !rainy && w.wind_kph < 15) {
    brief = "✅ Ideal farming weather. Good conditions for sowing and field work.";
    icon = "🌤️";
    severity = "good";
  } else {
    brief = `Partly ${w.condition.text.toLowerCase()} — check field conditions before work.`;
    icon = "🌾";
    severity = "good";
  }

  // ── Irrigation ────────────────────────────────────────────────────────
  let irrigation: FarmingAdvisory["irrigation"];
  if (rainy || thunder) {
    irrigation = { advice: "Rain expected — skip irrigation today to avoid waterlogging.", status: "skip" };
  } else if (w.temp_c > 35 || (lowHumidity && w.temp_c > 28)) {
    irrigation = { advice: "High evaporation rate. Irrigate early morning or evening.", status: "needed" };
  } else if (frost) {
    irrigation = { advice: "Avoid irrigation near frost — wet soil increases frost damage.", status: "skip" };
  } else {
    irrigation = { advice: "Soil moisture should be adequate. Monitor crop wilting signs.", status: "ok" };
  }

  // ── Spray Window ─────────────────────────────────────────────────────
  let sprayWindow: FarmingAdvisory["sprayWindow"];
  if (thunder || rainy) {
    sprayWindow = { advice: "Do NOT spray — rain will wash away pesticides and herbicides.", status: "avoid" };
  } else if (highWind || w.wind_kph > 15) {
    sprayWindow = { advice: "Wind too high for safe spraying. Risk of chemical drift to adjacent crops.", status: "avoid" };
  } else if (w.is_day === 1 && w.wind_kph < 15 && !rainy) {
    sprayWindow = { advice: "Good spray window in the morning before 10am. Low wind & clear sky.", status: "good" };
  } else {
    sprayWindow = { advice: "Moderate conditions — spray cautiously, watch wind direction.", status: "limited" };
  }

  // ── Disease Risk ─────────────────────────────────────────────────────
  let diseaseRisk: FarmingAdvisory["diseaseRisk"];
  if (highHumidity && w.temp_c >= 18) {
    diseaseRisk = { advice: "High risk of fungal diseases (blight, rust, mildew). Inspect crops closely.", level: "high" };
  } else if (rainy && w.temp_c >= 15) {
    diseaseRisk = { advice: "Moderate fungal/bacterial risk after rainfall. Apply preventive fungicide.", level: "moderate" };
  } else if (w.humidity > 60) {
    diseaseRisk = { advice: "Mild disease risk. Regular scouting recommended for early detection.", level: "moderate" };
  } else {
    diseaseRisk = { advice: "Low disease pressure. Maintain regular crop scouting routines.", level: "low" };
  }

  // ── Field Work ────────────────────────────────────────────────────────
  let fieldWork: FarmingAdvisory["fieldWork"];
  if (thunder) {
    fieldWork = { advice: "Avoid all outdoor field work during thunderstorms — safety risk.", status: "avoid" };
  } else if (heat && w.is_day === 1) {
    fieldWork = { advice: "Work only in early morning or after 5pm to avoid heat exhaustion.", status: "limited" };
  } else if (rainy) {
    fieldWork = { advice: "Wet soil — avoid heavy machinery to prevent soil compaction.", status: "limited" };
  } else if (w.temp_c >= 15 && w.temp_c <= 35 && w.wind_kph < 20) {
    fieldWork = { advice: "Good conditions for ploughing, sowing, and harvesting.", status: "suitable" };
  } else {
    fieldWork = { advice: "Conditions are marginal — plan lighter tasks and monitor changes.", status: "limited" };
  }

  return {
    brief, icon, severity,
    irrigation, sprayWindow, diseaseRisk, fieldWork,
    frostWarning: frost,
    heatStress: heat,
  };
}
