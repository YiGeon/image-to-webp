const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 700,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle file selection dialog
ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'] }
    ]
  });
  return result.filePaths;
});

// Handle save directory selection
ipcMain.handle('select-save-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory']
  });
  return result.filePaths[0] || null;
});

// Convert single image to WebP
async function convertToWebP(inputPath, outputDir, quality) {
  const filename = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${filename}.webp`);
  const ext = path.extname(inputPath).toLowerCase();

  // Check if it's an animated image (GIF)
  const isAnimated = ext === '.gif';

  await sharp(inputPath, { animated: isAnimated })
    .webp({ quality: quality })
    .toFile(outputPath);

  const inputStats = fs.statSync(inputPath);
  const outputStats = fs.statSync(outputPath);

  return {
    inputPath,
    outputPath,
    inputSize: inputStats.size,
    outputSize: outputStats.size
  };
}

// Handle batch conversion
ipcMain.handle('convert-images', async (event, { files, outputDir, quality }) => {
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const result = await convertToWebP(file, outputDir, quality);
      results.push({
        success: true,
        ...result
      });
      // Send progress update
      mainWindow.webContents.send('conversion-progress', {
        current: i + 1,
        total: files.length,
        file: path.basename(file)
      });
    } catch (error) {
      results.push({
        success: false,
        inputPath: file,
        error: error.message
      });
    }
  }

  return results;
});
