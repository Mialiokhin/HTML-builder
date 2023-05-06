const fs = require('fs').promises;
const path = require('path');

async function copyDir() {
  const sourceDir = path.join(__dirname, 'files');
  const targetDir = path.join(__dirname, 'files-copy');

  //Создаем папку для копии, если она не существует
  try {
    await fs.access(targetDir);
  } catch {
    await fs.mkdir(targetDir, {recursive: true});
  }

  //Получаем список файлов и папок в исходной папке
  const files = await fs.readdir(sourceDir, {withFileTypes: true});

  //Копируем файлы и папки рекурсией
  await Promise.all(
    files.map(async (file) => {
      const source = path.join(sourceDir, file.name);
      const target = path.join(targetDir, file.name);
      if (file.isDirectory()) {
        await copyDir(source, target);
      } else {
        await fs.copyFile(source, target);
      }
    })
  );

  //Удаляем лишние файлы
  const targetFiles = await fs.readdir(targetDir);
  const sourceFiles = files.map((file) => file.name);
  await Promise.all(
    targetFiles
      .filter((file) => !sourceFiles.includes(file))
      .map(async (file) => {
        const target = path.join(targetDir, file);
        await fs.unlink(target);
      })
  );
}

copyDir().catch(console.error);