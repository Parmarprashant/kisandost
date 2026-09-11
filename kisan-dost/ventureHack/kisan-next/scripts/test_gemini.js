
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  try {
    const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Just to initialize
    // The SDK might not have a direct listModels on the genAI object in all versions in the same way
    // But we can try to find where it is or use a known one.
    console.log("Attempting to list models...");
    // In newer SDKs:
    // const result = await genAI.listModels();
    // However, let's just try gemini-1.5-flash-latest and gemini-1.5-flash
    console.log("Testing gemini-1.5-flash-latest...");
  } catch (e) {
    console.error(e);
  }
}

// Actually, let's use a simpler approach to just test names.
async function testModel(name) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: name });
    try {
        console.log(`Testing model: ${name}`);
        const result = await model.generateContent("Hi");
        console.log(`Success with ${name}:`, result.response.text());
        return true;
    } catch (e) {
        console.log(`Failure with ${name}:`, e.message);
        return false;
    }
}

async function run() {
    await testModel("gemini-1.5-flash");
    await testModel("gemini-1.5-flash-latest");
    await testModel("gemini-pro");
}

run();
