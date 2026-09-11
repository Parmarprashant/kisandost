/**
 * TensorFlow.js Yield Prediction Model Training Script
 *
 * Generates a synthetic agricultural dataset and trains a regression model
 * to predict crop yield (tons/hectare) from NDVI, soil moisture, and rainfall.
 *
 * Usage:  node scripts/trainYieldModel.js
 */

const tf = require("@tensorflow/tfjs");
const fs = require("fs");
const path = require("path");

// ── 1. Synthetic dataset generation ──────────────────────────────────────────

function generateDataset(numSamples = 500) {
  const data = [];

  for (let i = 0; i < numSamples; i++) {
    const ndvi = 0.3 + Math.random() * 0.6;            // 0.3 – 0.9
    const soilMoisture = 15 + Math.random() * 30;       // 15  – 45 %
    const rainfall = 50 + Math.random() * 250;           // 50  – 300 mm

    // Realistic yield formula with some noise
    const yield_val =
      1.5 +
      (ndvi - 0.3) * 5.0 +
      (soilMoisture - 15) / 30 * 1.5 +
      (rainfall - 50) / 250 * 1.5 +
      (Math.random() - 0.5) * 0.4;

    const clampedYield = Math.max(1.5, Math.min(6, yield_val));
    data.push({ ndvi, soilMoisture, rainfall, yield: clampedYield });
  }

  return data;
}

// ── 2. Train model ───────────────────────────────────────────────────────────

async function trainModel() {
  console.log("🌾 Generating synthetic dataset (500 samples)...");
  const dataset = generateDataset(500);

  const inputs = dataset.map((d) => [d.ndvi, d.soilMoisture, d.rainfall]);
  const labels = dataset.map((d) => d.yield);

  const xs = tf.tensor2d(inputs);
  const ys = tf.tensor2d(labels, [labels.length, 1]);

  // Compute normalization parameters
  const inputMax = xs.max(0);
  const inputMin = xs.min(0);
  const labelMax = ys.max();
  const labelMin = ys.min();

  const xsNorm = xs.sub(inputMin).div(inputMax.sub(inputMin));
  const ysNorm = ys.sub(labelMin).div(labelMax.sub(labelMin));

  // Build sequential model
  console.log("🧠 Building model...");
  const model = tf.sequential();

  model.add(
    tf.layers.dense({
      inputShape: [3],
      units: 10,
      activation: "relu",
    })
  );

  model.add(
    tf.layers.dense({
      units: 1,
    })
  );

  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: "meanSquaredError",
  });

  model.summary();

  // Train
  console.log("🏋️ Training for 200 epochs...");
  await model.fit(xsNorm, ysNorm, {
    epochs: 200,
    batchSize: 32,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if ((epoch + 1) % 50 === 0) {
          console.log(
            `  Epoch ${epoch + 1}/200 — loss: ${logs.loss.toFixed(6)} — val_loss: ${logs.val_loss.toFixed(6)}`
          );
        }
      },
    },
  });

  // ── 3. Save model weights and topology as JSON ─────────────────────────────

  const modelDir = path.join(__dirname, "..", "src", "lib", "ai", "yield-model");

  if (!fs.existsSync(modelDir)) {
    fs.mkdirSync(modelDir, { recursive: true });
  }

  console.log(`💾 Saving model to ${modelDir}...`);

  // Extract model topology
  const topology = model.toJSON();

  // Extract weights
  const weightData = [];
  for (const layer of model.layers) {
    const weights = layer.getWeights();
    for (const w of weights) {
      weightData.push({
        name: w.name,
        shape: w.shape,
        dtype: w.dtype,
        data: Array.from(w.dataSync()),
      });
    }
  }

  // Save model.json (topology + weight manifest)
  const modelJson = {
    modelTopology: JSON.parse(topology),
    weightsManifest: [{
      paths: ["weights.bin"],
      weights: weightData.map(w => ({
        name: w.name,
        shape: w.shape,
        dtype: w.dtype,
      })),
    }],
  };

  fs.writeFileSync(
    path.join(modelDir, "model.json"),
    JSON.stringify(modelJson, null, 2)
  );

  // Save weights as a JSON file (since we can't easily write binary in pure JS)
  fs.writeFileSync(
    path.join(modelDir, "weights.json"),
    JSON.stringify(weightData, null, 2)
  );

  // Save normalization parameters
  const normParams = {
    inputMin: inputMin.arraySync(),
    inputMax: inputMax.arraySync(),
    labelMin: labelMin.arraySync(),
    labelMax: labelMax.arraySync(),
  };

  fs.writeFileSync(
    path.join(modelDir, "norm-params.json"),
    JSON.stringify(normParams, null, 2)
  );

  console.log("✅ Model and normalization params saved successfully!");

  // Quick test prediction
  const testInput = tf.tensor2d([[0.7, 35, 200]]);
  const testNorm = testInput.sub(inputMin).div(inputMax.sub(inputMin));
  const predNorm = model.predict(testNorm);
  const pred = predNorm.mul(labelMax.sub(labelMin)).add(labelMin);
  console.log(`\n🔮 Test prediction (NDVI=0.7, Moisture=35%, Rain=200mm):`);
  console.log(`   Predicted yield: ${pred.dataSync()[0].toFixed(2)} tons/hectare`);

  // Cleanup
  xs.dispose();
  ys.dispose();
  xsNorm.dispose();
  ysNorm.dispose();
}

trainModel().catch(console.error);
