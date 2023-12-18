const { app, BrowserWindow } = require('electron');
const puppeteer = require('puppeteer');
const PAGELOADDELAY = 1000;
const AMAZONJOBS = 'https://www.amazon.jobs/en/search?offset=0&result_limit=10&sort=relevant&business_category[]=amazon-web-services';
const HUNTRURL = 'https://huntr.co/track/goals/current';
const HUNTREMAIL = 'rokas@jerio.me';
const HUNTRPASSWORD = 'KKZ5UCjRU8Dtuh';

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

const pageLoadDelay = async () => {
  await new Promise(r => setTimeout(r, PAGELOADDELAY));
}

// Go to page and apply default page load delay
const goToPage = async (url, page) => {
  await page.goto(url);
  await pageLoadDelay();
  return page;
}

// Visit page and run optional function before returning the page html
const pageHtml = async (url, page, preReturnFunction = null) => {
  const targetPage = await goToPage(url, page);
  const functionedPage = preReturnFunction ? await preReturnFunction(targetPage) : targetPage;
  const html = await functionedPage.content();
  return html;
}

// Click on the selector element and wait to be redirected. Allows multiple redirects.
const clickAndWaitForRedirect = async (selector, page, repeatRedirectTimes = 0) => {
  await Promise.all([
    page.waitForNavigation(),
    page.waitForSelector(selector, { visible: true }),
    page.click(selector, page),
  ]);
  await pageLoadDelay();

  while (repeatRedirectTimes > 0) {
    await page.waitForNavigation();
    await pageLoadDelay();
    repeatRedirectTimes -= 1;
  }
}

// Login to Huntr, assuming the page is already at 'https://huntr.co/login'
const fillAndSubmitLoginHuntr = (email, password) => {
  return async (page) => {
    await page.locator('input[type="email"]')
      .setEnsureElementIsInTheViewport(false)
      .fill(email);
    
    await page.locator('input[type="password"]')
      .setEnsureElementIsInTheViewport(false)
      .fill(password);

    await clickAndWaitForRedirect('button[color="#6A4FEB"]', page, 1);
    return page;
  }
}

// Testing - Allows me to see the html immediately after logging in
const returnHuntrLoginHtml = async (page) => {
  const huntrLoginHtml = await pageHtml(HUNTRURL, page, fillAndSubmitLoginHuntr(HUNTREMAIL, HUNTRPASSWORD));
  return huntrLoginHtml;
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

  const testHuntrFlowHtml = await returnHuntrLoginHtml(page) // good for testing, will ultimately just be a headless series of functions called on page

  mainWindow.loadURL(`data:text/html,${encodeURIComponent(testHuntrFlowHtml)}`);
  
  mainWindow.webContents.openDevTools(); // good for testing, will ultimately be removed

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  })
})