const { app, BrowserWindow } = require('electron');
const playwright = require('playwright');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 750,
    webPreferences: {
      webgl: false,
      hardwareAcceleration: false,
    },
  });

 return win;
}

// Close the app when all windows are closed on Windows and Linux
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
})

// Start the app and create a window
app.whenReady().then(async () => {
  const mainWindow = createWindow();

  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  // Visit page 
  await page.goto('https://google.com/');
  await page.getByTitle('Search').fill('test'); // doesn't work

  const html = await page.content();

  await browser.close();

  mainWindow.loadURL(`data:text/html,${encodeURIComponent(html)}`);

  mainWindow.webContents.openDevTools();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  })
})