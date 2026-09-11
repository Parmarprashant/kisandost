
const https = require('https');
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.GEMINI_API_KEY;

function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  console.log(`Fetching models from: ${url}`);
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log("Status:", res.statusCode);
      try {
        const json = JSON.parse(data);
        if (json.models) {
          console.log("Models found:", json.models.map(m => m.name));
        } else {
          console.log("No models field. Full response:", JSON.stringify(json, null, 2));
        }
      } catch (e) {
        console.log("Failed to parse response:", data);
      }
    });
  }).on('error', (err) => {
    console.error("Error:", err.message);
  });
}

listModels();
