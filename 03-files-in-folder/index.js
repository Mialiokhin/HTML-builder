const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;
fsPromises.readdir(path.join(__dirname, 'secret-folder'), {
  withFileTypes: true
}).then(elements => {
  elements.forEach(element => {
    if (!element.isDirectory()) {
      const filePath = path.join(__dirname, 'secret-folder', element.name);
      const fileName = path.basename(filePath);
      const fileExt = path.extname(filePath);
      fsPromises.stat(filePath)
        .then(res => {
          console.log(`${fileName.replace(fileExt, '')} - ${fileExt.replace('.', '')} - ${Number(res.size / 1024)}kb`);
        });
    }
  });
});