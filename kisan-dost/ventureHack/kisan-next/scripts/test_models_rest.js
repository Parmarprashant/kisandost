
const https = require('https');
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.GEMINI_API_KEY;

function testModel(name) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      contents: [{ parts: [{ text: "Identify this: Test" }] }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/${name}:generateContent?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (d) => { responseBody += d; });
      res.on('end', () => {
        console.log(`Model: ${name}, Status: ${res.statusCode}`);
        try {
            const json = JSON.parse(responseBody);
            if (res.statusCode === 200) {
                console.log(`  Success! Response snippet: ${responseBody.substring(0, 50)}...`);
                resolve(true);
            } else {
                console.log(`  Error: ${json.error?.message || responseBody}`);
                resolve(false);
            }
        } catch(e) {
            console.log(`  Failed to parse: ${responseBody}`);
            resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`  Req Error: ${e.message}`);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
}

async function run() {
  // Test common names and the ones found in the list
  await testModel("gemini-1.5-flash");
  await testModel("gemini-2.5-flash");
  await testModel("gemini-flash-latest");
}

run();
