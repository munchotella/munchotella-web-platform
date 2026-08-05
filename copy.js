const fs = require('fs');
const path = require('path');

function copyFolderSync(from, to) {
    fs.mkdirSync(to, { recursive: true });
    fs.readdirSync(from).forEach(element => {
        if (fs.lstatSync(path.join(from, element)).isFile()) {
            fs.copyFileSync(path.join(from, element), path.join(to, element));
        } else {
            copyFolderSync(path.join(from, element), path.join(to, element));
        }
    });
}

const srcDir = path.join(__dirname, 'src', 'app');
const destDir = path.join(srcDir, '[locale]');

const items = ['admin', 'checkout', 'concept-1', 'concept-2', 'concept-3', 'concept-4', 'concept-5', 'contact', 'legal', 'menu', 'order-tracking', 'profile', 'recenzii'];

for (const item of items) {
  copyFolderSync(path.join(srcDir, item), path.join(destDir, item));
  console.log(`Copied ${item}`);
}

const files = ['page.tsx', 'layout.tsx', 'template.tsx'];
for (const file of files) {
  fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
}
