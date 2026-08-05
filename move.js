const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'app');
const destDir = path.join(srcDir, '[locale]');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir);
}

const items = fs.readdirSync(srcDir);

for (const item of items) {
  if (item === '[locale]' || item === 'favicon.ico' || item === 'globals.css') continue;
  
  const oldPath = path.join(srcDir, item);
  const newPath = path.join(destDir, item);
  
  fs.renameSync(oldPath, newPath);
  console.log(`Moved ${item} to [locale]`);
}
