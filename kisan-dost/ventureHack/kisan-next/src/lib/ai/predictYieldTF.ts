/**
 * TensorFlow.js Yield Prediction Module
 *
 * Loads pre-trained model weights from yield-model/ and predicts crop yield
 * per hectare from NDVI, soil moisture, and rainfall inputs.
 *
 * Falls back to a deterministic formula if the model is not available.
 */

import * as tf from "@tensorflow/tfjs";
import * as path from "path";
import * as fs from "fs";

interface YieldInput {
  ndvi: number;
  soil_moisture: number;
  rainfall: number;
}

interface NormParams {
  inputMin: number[];
  inputMax: number[];
  labelMin: number;
  labelMax: number;
}

interface WeightData {
  name: string;
  shape: number[];
  dtype: string;
  data: number[];
}

let cachedModel: tf.LayersModel | null = null;
let cachedNormParams: NormParams | null = null;

/** Average regional yield (tons/hectare) — used as a comparison baseline. */
export const AVERAGE_REGIONAL_YIELD = 3.5;

/**
 * Rebuild the model architecture and load saved weights from JSON.
 */
async function loadModel(): Promise<{
  model: tf.LayersModel;
  normParams: NormParams;
} | null> {
  if (cachedModel && cachedNormParams) {
    return { model: cachedModel, normParams: cachedNormParams };
  }

  const modelDir = path.join(
    process.cwd(),
    "src",
    "lib",
    "ai",
    "yield-model"
  );
  const weightsPath = path.join(modelDir, "weights.json");
  const normPath = path.join(modelDir, "norm-params.json");

  if (!fs.existsSync(weightsPath) || !fs.existsSync(normPath)) {
    console.warn(
      "⚠️  Yield model files not found – using formula fallback. Run `node scripts/trainYieldModel.js` to train."
    );
    return null;
  }

  try {
    // Rebuild model architecture (must match training script)
    const model = tf.sequential();
    model.add(
      tf.layers.dense({ inputShape: [3], units: 10, activation: "relu" })
    );
    model.add(tf.layers.dense({ units: 1 }));
    model.compile({ optimizer: "adam", loss: "meanSquaredError" });

    // Load weights from JSON
    const weightData: WeightData[] = JSON.parse(
      fs.readFileSync(weightsPath, "utf-8")
    );

    // Set weights for each layer
    let weightIndex = 0;
    for (const layer of model.layers) {
      const numWeights = layer.getWeights().length;
      if (numWeights > 0) {
        const tensors: tf.Tensor[] = [];
        for (let i = 0; i < numWeights; i++) {
          const wd = weightData[weightIndex++];
          tensors.push(tf.tensor(wd.data, wd.shape));
        }
        layer.setWeights(tensors);
      }
    }

    // Load normalization params
    cachedNormParams = JSON.parse(
      fs.readFileSync(normPath, "utf-8")
    ) as NormParams;
    cachedModel = model;

    console.log("✅ TF yield model loaded from", modelDir);
    return { model, normParams: cachedNormParams };
  } catch (err) {
    console.error("❌ Failed to load TF model, using fallback:", err);
    return null;
  }
}

/**
 * Deterministic formula fallback (same formula used to generate training data).
 */
function formulaFallback(input: YieldInput): number {
  const { ndvi, soil_moisture, rainfall } = input;
  const y =
    1.5 +
    (ndvi - 0.3) * 5.0 +
    ((soil_moisture - 15) / 30) * 1.5 +
    ((rainfall - 50) / 250) * 1.5;
  return Math.max(1.5, Math.min(6, parseFloat(y.toFixed(2))));
}

/**
 * Predict crop yield (tons per hectare).
 */
export async function predictYieldTF(
  input: YieldInput
): Promise<{ predicted_yield: number }> {
  const loaded = await loadModel();

  if (!loaded) {
    return { predicted_yield: formulaFallback(input) };
  }

  const { model, normParams } = loaded;

  // Normalize input
  const raw = tf.tensor2d([
    [input.ndvi, input.soil_moisture, input.rainfall],
  ]);
  const mins = tf.tensor1d(normParams.inputMin);
  const maxs = tf.tensor1d(normParams.inputMax);
  const normalized = raw.sub(mins).div(maxs.sub(mins));

  // Predict
  const predNorm = model.predict(normalized) as tf.Tensor;
  const pred = predNorm
    .mul(normParams.labelMax - normParams.labelMin)
    .add(normParams.labelMin);

  const value = (await pred.data())[0];

  // Cleanup tensors
  raw.dispose();
  mins.dispose();
  maxs.dispose();
  normalized.dispose();
  predNorm.dispose();
  pred.dispose();

  const clampedValue = Math.max(1.5, Math.min(6, parseFloat(value.toFixed(2))));
  return { predicted_yield: clampedValue };
}
