const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, './src');

const renameFiles = (dir) => {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const isDirectory = fs.lstatSync(filePath).isDirectory();

    if (isDirectory) {
      renameFiles(filePath);
    } else {
      const fileExtension = path.extname(filePath);
      const fileName = path.basename(filePath, fileExtension);

      if (fileExtension === '.jsx') {
        const newFilePath = path.join(dir, `${fileName}.tsx`);
        fs.renameSync(filePath, newFilePath);
      }
      if (fileExtension === '.js') {
        const newFilePath = path.join(dir, `${fileName}.ts`);
        fs.renameSync(filePath, newFilePath);
      }
    }
  });
};

renameFiles(srcPath);
