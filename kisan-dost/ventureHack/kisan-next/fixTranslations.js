const fs = require('fs');

const langs = ['en', 'hi', 'gu'];
for (const lang of langs) {
  const path = `./messages/${lang}.json`;
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  if (data.ProductsPage) {
    if (lang === 'en') {
      data.ProductsPage.solvesLabel = "Solves";
    } else if (lang === 'hi') {
      data.ProductsPage.solvesLabel = "समाधान";
    } else if (lang === 'gu') {
      data.ProductsPage.solvesLabel = "ઉકેલ";
    }
  }
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

console.log('Fixed solvesLabel');
