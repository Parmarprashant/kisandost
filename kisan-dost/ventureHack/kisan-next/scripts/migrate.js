import fs from 'fs';
import path from 'path';

// Parse the file manually since it's TS
const tsFile = fs.readFileSync(path.join(process.cwd(), 'src/data/crop-diseases.ts'), 'utf-8');

// We just copy the object string and evaluate it
const arrayMatch = tsFile.match(/export const CROP_DATA: Crop\[\] = (\[[\s\S]*\]);/);
if (arrayMatch && arrayMatch[1]) {
  try {
    // A bit hacky but works for static data
    const dataString = arrayMatch[1].replace(/(\w+): /g, '"$1": ').replace(/'/g, '"');
    
    // Actually safer to just map it out via a quick ES loader but we are in a simple script
    const enPath = path.join(process.cwd(), 'messages/en.json');
    const hiPath = path.join(process.cwd(), 'messages/hi.json');
    const guPath = path.join(process.cwd(), 'messages/gu.json');

    const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
    const gu = JSON.parse(fs.readFileSync(guPath, 'utf8'));

    en.Crops = {};
    hi.Crops = {};
    gu.Crops = {};

    // We will just let the LLM generate the JSON structures directly next since this script is too complex to parse the TS safely without transpiling.
    console.log("Script strategy aborted. Generating JSONs directly.");

  } catch (e) {
    console.error(e);
  }
}
