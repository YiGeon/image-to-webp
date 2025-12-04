const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFiles: () => ipcRenderer.invoke('select-files'),
  selectSaveDirectory: () => ipcRenderer.invoke('select-save-directory'),
  convertImages: (options) => ipcRenderer.invoke('convert-images', options),
  onConversionProgress: (callback) => {
    ipcRenderer.on('conversion-progress', (event, data) => callback(data));
  },
  getPathForFile: (file) => webUtils.getPathForFile(file)
});
