import { ICropAdvisory } from '@/models/CropAdvisory';
import { getActiveAdvisory } from './cropStage';

export interface EnrichedAdvisory {
   title: string;
   body: string;
   message: string;
   rainfallCondition: string;
   recommendationCategory: string;
   dosageText: string;
}

/**
 * Fetches the geographical rainfall conditions using free geocoding infrastructure.
 */
export async function getRainfallCondition(location: string): Promise<string> {
  try {
     const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`);
     const geoData = await geoRes.json();
     const first = geoData?.results?.[0];
     if (!first) return "Normal";

     const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${first.latitude}&longitude=${first.longitude}&current=precipitation`);
     const weatherData = await weatherRes.json();
     const precip = weatherData?.current?.precipitation || 0;

     if (precip >= 10) return "Heavy";
     if (precip === 0) return "Low";
     return "Normal";
  } catch(e) {
     return "Normal"; 
  }
}

/**
 * Generates an advisory payload layered with rainfall condition heuristics and scalable approximate dosing.
 */
export async function getEnhancedAdvisory(
   crop: { cropType: string; location: string; landArea: number },
   daysAfterSowing: number
): Promise<{ advisory: ICropAdvisory; enriched: EnrichedAdvisory } | null> {
   
   const advisory = await getActiveAdvisory(crop.cropType, daysAfterSowing);
   if (!advisory) return null;

   const rainfall = await getRainfallCondition(crop.location);
   
   const totalDosage = advisory.dosagePerAcre * crop.landArea;
   const dosageText = `Approximate dose: ${totalDosage.toFixed(1)} required for your ${crop.landArea} acres. Follow local agronomy or specific product label guidance safely.`;

   const baseMessage = advisory.messageTemplate
        .replace('{{dosage}}', totalDosage.toFixed(1))
        .replace('{{pesticide}}', advisory.pesticideName)
        .replace('{{stage}}', advisory.stageName);

   let titleTemplate = "Standard Alert";
   let weatherWarning = "";

   if (rainfall === "Heavy") {
      titleTemplate = "⚠️ Wet Weather Alert";
      weatherWarning = " \n[Weather Caution]: Heavy rainfall detected in your region. Delay application to avoid washout runoff, and actively monitor for fungal accumulation.";
   } else if (rainfall === "Low") {
      titleTemplate = "☀️ Dry Weather Alert";
      weatherWarning = " \n[Weather Caution]: Dry terrain conditions detected. Ensure solid topsoil moisture before applying crop treatments in split doses.";
   } else {
      titleTemplate = "✅ KisanDost Crop Alert";
   }

   const enrichedBody = baseMessage + weatherWarning + "\n\n" + dosageText;

   return {
      advisory,
      enriched: {
         title: titleTemplate,
         body: enrichedBody,
         message: enrichedBody, 
         rainfallCondition: rainfall,
         recommendationCategory: advisory.purpose,
         dosageText
      }
   };
}
