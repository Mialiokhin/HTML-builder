const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;
fs.writeFile(
  path.join(__dirname, 'project-dist', 'bundle.css'),
  '',
  (err) => {
    if (err) throw err;
  }
);
fsPromises.readdir(path.join(__dirname, 'styles'), {
  withFileTypes: true
}).then(elements => {
  elements.forEach(element => {
    if (!element.isDirectory()) {
      const filePath = path.join(__dirname, 'styles', element.name);
      const fileName = path.basename(filePath);
      const fileExt = path.extname(filePath);
      if (fileExt === '.css') {
        fs.readFile(
          path.join(__dirname, 'styles', fileName),
          'utf-8',
          (err, data) => {
            if (err) throw err;
            const lines = data.toString().split('\n');
            fs.appendFile(
              path.join(__dirname, 'project-dist', 'bundle.css'),
              `/*Style from ${fileName} file*/ \n ${lines.join('\n')}`, (err) => {
                if (err) {
                  console.error(err);
                }
              }
            );
          }
        );
      }
    }
  });
});


