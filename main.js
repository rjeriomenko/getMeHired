const { app, BrowserWindow } = require('electron');
const puppeteer = require('puppeteer');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 750,
    webPreferences: {
      devTools: true,
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

  const browser = await puppeteer.launch({ headless:true });
  const page = await browser.newPage();

  // Visit page 
  await page.goto('https://www.amazon.jobs/en/search?offset=0&result_limit=10&sort=relevant&business_category[]=amazon-web-services');
  await new Promise(r => setTimeout(r, 5000));
  const html = await page.content();

  mainWindow.loadURL(`data:text/html,${encodeURIComponent(html)}`);
  
  mainWindow.webContents.openDevTools();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  })
})