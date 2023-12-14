const { app, BrowserWindow } = require('electron');
const path = require('node:path');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, 'hello-world-preload.js')
    }
  });

  win.loadFile('hello-world.html');
}

// Close the app when all windows are closed on Windows and Linux
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
})

// Start the app and create a window
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  })
})