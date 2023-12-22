const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  createHuntrJob: () => {
    ipcRenderer.send('create-huntr-job');
  }
});