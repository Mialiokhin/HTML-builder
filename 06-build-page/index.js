const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;
const components = [];
const componentsContent = [];
let templateFile = [];
// Создаем папку project-dist
const folderPath = path.join(__dirname, 'project-dist');
fs.access(folderPath, fs.constants.F_OK, (err) => {
  if (err) {
    fs.mkdir(folderPath, (err) => {
      if (err) throw err;

      // Создаем файл index.html
      fs.writeFile(
        path.join(__dirname, 'project-dist', 'index.html'),
        '',
        (err) => {
          if (err) throw err;
        }
      );

      // Создаем файл style.css
      fs.writeFile(
        path.join(__dirname, 'project-dist', 'style.css'),
        '',
        (err) => {
          if (err) throw err;
        }
      );
      console.log('Папка была создана');
    });
  } else {
    console.log('Папка уже существует');
  }
});

//создаем массив названий компонентов
fsPromises.readdir(path.join(__dirname, 'components'), {
  withFileTypes: true
}).then(elements => {
  // Loop through each file in the "components" directory
  const promises = elements.map(element => {
    if (element.isFile() && path.extname(element.name) === '.html') {
      const filePath = path.join(__dirname, 'components', element.name);
      const componentName = path.basename(filePath, '.html');
      components.push(componentName);

      // Read the contents of the file and add it to the "componentsContent" array
      return fsPromises.readFile(filePath, 'utf-8')
        .then(content => {
          componentsContent.push(content.split('\n'));
        });
    }
  });

  // Wait for all the promises to resolve before continuing
  return Promise.all(promises);
}).then(() => {
  console.log(components);
  console.log(componentsContent);
}).then(() => {
  return fsPromises.readFile(
    path.join(__dirname, 'template.html'),
    'utf-8'
  );
}).then(data => {
  const lines = data.toString().split('\n');
  for (let component in components) {
    console.log(components[component]);
    let index = lines.findIndex(line => line.includes(`{{${components[component]}}}`));
    console.log(index);
    while (index !== -1) {
      lines[index] = lines[index].replace(`{{${components[component]}}}`, `${componentsContent[component].join('\n')}`);
      index = lines.findIndex(line => line.includes(`{{${components[component]}}}`));
    }
  }
  templateFile.push(lines);
  console.log(templateFile);
  fs.appendFile(
    path.join(__dirname, 'project-dist', 'index.html'),
    `${lines.join('\n')}`, (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
}).then(() => {

}).catch(error => {
  console.error(error);
});


