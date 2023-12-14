const { app, BrowserWindow } = require('electron');
const puppeteer = require('puppeteer');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 750,
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

  const browser = await puppeteer.launch({ headless:true });
  const page = await browser.newPage();

  // Visit page 
  await page.goto('https://jerio.me');
  const html = await page.content();
  console.log(html)

  mainWindow.loadURL(`data:text/html,${encodeURIComponent(html)}`);

  // Create a window on mac if the app is running with no windows
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  })
})