import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️ GEMINI_API_KEY is not defined in the environment.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export interface GeminiDiseaseResult {
  cropName: string;
  diseaseName: string;
  confidence: number;
  symptoms: string[];
  causes: string[];
  precautions: string[];
  recommendedPesticides: string[];
  recommendedFertilizers: string[];
}

export interface DistrictSuggestion {
  district: string;
  suggestion: string;
  crops: string[];
  weather: string;
  advisory: string;
}

/**
 * Converts a Blob or File to a base64 string
 */
async function fileToBase64(file: Blob): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString("base64");
}

export async function analyzeCropDisease(file: Blob): Promise<GeminiDiseaseResult> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please configure your environment variables.");
  }

  const base64Data = await fileToBase64(file);
  const mimeType = file.type || "image/jpeg";

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };

  const prompt = `Analyze this crop leaf image.

Identify:
1. Crop type
2. Disease name (if any)
3. Confidence level (as an integer number between 0 and 100, e.g. 92)
4. Symptoms (bullet points of agronomic symptoms observed)
5. Causes (probable pathogens, environmental triggers)
6. Precautions farmers should take
7. Recommended pesticides (generic active ingredients or well-known brands)
8. Recommended fertilizers

Return the result strictly in JSON format matching this exact structure, with no markdown formatting or backticks outside of the JSON block:

{
  "cropName": "",
  "diseaseName": "",
  "confidence": 0,
  "symptoms": [],
  "causes": [],
  "precautions": [],
  "recommendedPesticides": [],
  "recommendedFertilizers": []
}

If the crop is healthy, indicate 'Healthy Plant' for diseaseName.`;

  const candidateModels = [
    process.env.GEMINI_MODEL,
    "gemini-2.5-flash",
    "gemini-3.8-flash",
    "gemini-2.0-flash",
  ].filter(Boolean) as string[];

  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      console.log(`[GeminiService] Attempting ${modelName} for image analysis...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([prompt, imagePart]);
      const responseText = result.response.text();

      // Strip markdown code block wrappers if Gemini includes them
      const cleanedText = responseText.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
      const parsedData: GeminiDiseaseResult = JSON.parse(cleanedText);
      if (parsedData.confidence > 0 && parsedData.confidence <= 1) {
        parsedData.confidence = Math.round(parsedData.confidence * 100);
      }
      return parsedData;
    } catch (err: any) {
      console.warn(`[GeminiService] Model ${modelName} failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to analyze image with Gemini models.");
}

export async function getDistrictSuggestion(district: string, season: string = "Kharif", waterAvailability: string = "Medium", recommendedCrops: string[] = []): Promise<string> {
  // No literal fallback. A key committed here is a key published: this file
  // is in git, and the previous default was a live credential.
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  if (!nvidiaKey) {
    throw new Error(
      "NVIDIA_API_KEY is not set. District suggestions need it."
    );
  }

  const cropsText = recommendedCrops.length > 0 ? recommendedCrops.join(", ") : "traditional crops";

  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const prompt = `You are an expert agricultural advisor for Gujarat, India. Provide concise farming advice for ${district} district.

Key Information:
- Current Date: ${currentDate}
- District: ${district}
- General Season Info: ${season}
- Water Availability: ${waterAvailability}
- Recommended Crops: ${cropsText}

Provide an actionable advisory (3-4 sentences) that includes:
1. Immediate best farming practices based on the CURRENT DATE (${currentDate}).
2. Essential preparations the farmer should make for the upcoming 1-2 months.
3. Water management tips considering the current time of year and ${waterAvailability} conditions.
4. Specific advice for growing the recommended crops and pest/disease prevention right now.

Make it explicitly relevant to the current month and upcoming months. Be practical and concise.`;

  console.log(`[AIService] Getting enhanced district suggestions for ${district} using NVIDIA API...`);
  
  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${nvidiaKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        model: "meta/llama3-70b-instruct",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 512,
        temperature: 0.5
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AIService] NVIDIA API Error:", errorText);
      throw new Error(`NVIDIA API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const advisory = data.choices[0]?.message?.content?.trim();

    return advisory || "No suggestion could be generated at this time.";
  } catch (error) {
    console.error("[AIService] Failed to fetch from NVIDIA API:", error);
    throw new Error("Failed to get AI suggestion from NVIDIA API.");
  }
}
