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
    });
  }
});

// Копируем папку assets в project-dist
const assetsFolderPath = path.join(__dirname, 'assets');
const projectDistAssetsFolderPath = path.join(__dirname, 'project-dist', 'assets');
fs.mkdir(projectDistAssetsFolderPath, {recursive: true}, (err) => {
  if (err) throw err;

  fs.readdir(assetsFolderPath, {withFileTypes: true}, (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
      const source = path.join(assetsFolderPath, file.name);
      const destination = path.join(projectDistAssetsFolderPath, file.name);

      if (file.isDirectory()) {
        fs.mkdir(destination, {recursive: true}, (err) => {
          if (err) throw err;
          copyFolder(source, destination);
        });
      } else {
        fs.copyFile(source, destination, (err) => {
          if (err) throw err;
        });
      }
    });
  });
});


//создаем html из шаблона и компонентов
fsPromises.readdir(path.join(__dirname, 'components'), {
  withFileTypes: true
}).then(elements => {
  // создаем массив имен компонентов
  const promises = elements.map(element => {
    if (element.isFile() && path.extname(element.name) === '.html') {
      const filePath = path.join(__dirname, 'components', element.name);
      const componentName = path.basename(filePath, '.html');
      components.push(componentName);

      // создаем массив содержания компонентов
      return fsPromises.readFile(filePath, 'utf-8')
        .then(content => {
          componentsContent.push(content.split('\n'));
        });
    }
  });

  // ждем окончания всех обещаний
  return Promise.all(promises);
}).then(() => {
  return fsPromises.readFile(
    path.join(__dirname, 'template.html'),
    'utf-8'
  );
}).then(data => {
  // заменяем шаблонные теги на содержание компонентов
  const lines = data.toString().split('\n');
  for (let component in components) {
    let index = lines.findIndex(line => line.includes(`{{${components[component]}}}`));
    while (index !== -1) {
      lines[index] = lines[index].replace(`{{${components[component]}}}`, `${componentsContent[component].join('\n')}`);
      index = lines.findIndex(line => line.includes(`{{${components[component]}}}`));
    }
  }
  templateFile.push(lines);
  // записываем index.html
  fs.writeFile(
    path.join(__dirname, 'project-dist', 'index.html'),
    `${lines.join('\n')}`, (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
}).catch(error => {
  console.error(error);
});

// собираем файл стилей
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
              path.join(__dirname, 'project-dist', 'style.css'),
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


async function copyFolder(srcDir, destDir) {
  // Создаем новую директорию
  fs.mkdir(destDir, {recursive: true}, (err) => {
    if (err) throw err;

    // Читаем файлы и директории в исходной директории
    fs.readdir(srcDir, {withFileTypes: true}, (err, files) => {
      if (err) throw err;

      // Обходим все элементы в директории
      files.forEach((file) => {
        const srcPath = path.join(srcDir, file.name);
        const destPath = path.join(destDir, file.name);

        // Если элемент является файлом
        if (file.isFile()) {
          // Копируем файл в новую директорию
          fs.copyFile(srcPath, destPath, (err) => {
            if (err) throw err;
          });
        }
        // Если элемент является директорией
        else if (file.isDirectory()) {
          // Рекурсивно копируем поддиректорию
          copyFolder(srcPath, destPath);
        }
      });

      // Удаляем файлы и пустые директории из новой директории, которых нет в исходной директории
      fs.readdir(destDir, {withFileTypes: true}, (err, files) => {
        if (err) throw err;

        files.forEach((file) => {
          const destPath = path.join(destDir, file.name);

          // Если элемент является файлом
          if (file.isFile()) {
            // Удаляем файл, если он не существует в исходной директории
            if (!fs.existsSync(path.join(srcDir, file.name))) {
              fs.unlink(destPath, (err) => {
                if (err) throw err;
              });
            }
          }
          // Если элемент является директорией
          else if (file.isDirectory()) {
            // Рекурсивно удаляем поддиректорию, если она не существует в исходной директории
            if (!fs.existsSync(path.join(srcDir, file.name))) {
              deleteFolder(destPath);
            }
          }
        });
      });
    });
  });
}


async function deleteFolder(folder) {
  try {
    const files = await fsPromises.readdir(folder);
    for (const file of files) {
      const curPath = path.join(folder, file);
      const stats = await fsPromises.stat(curPath);
      if (stats.isDirectory()) { // если папка
        await deleteFolder(curPath);
      } else { // если файл
        await fsPromises.unlink(curPath);
      }
    }
    await fsPromises.rmdir(folder); // удаляем саму папку
  } catch (err) {
    console.error(`Ошибка при удалении папки ${folder}: ${err.message}`);
  }
}