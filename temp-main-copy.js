const {
  goToPage,
  createWindow,
  clickAndWaitForRedirect,
  pageLoadDelay,
  logElementHandle,
} = require("./utils");
const config = require("./config");
const credentials = require("./credentials");
const { app } = require('electron');
const puppeteer = require('puppeteer');

// Login to Huntr at 'https://huntr.co/login'
// Go to the page, fill the fields, submit, wait for 2 redirects
const loginHuntr = async (page) => {
  await goToPage(config.huntrGoalsDashboardUrl, page);
  await page.locator('input[type="email"]')
    .setEnsureElementIsInTheViewport(false)
    .fill(credentials.huntrEmail);
  await page.locator('input[type="password"]')
    .setEnsureElementIsInTheViewport(false)
    .fill(credentials.huntrPassword);
  await clickAndWaitForRedirect('button[color="#6A4FEB"]', page, 1);
}

const findAndClickJobBlock = async (jobBlockTitle, page) => {
  const parentDivHandle = await page.waitForSelector(`.list-container.transparent-scrollbar.small:has(input[value="${jobBlockTitle}"])`);
  const addJobBlockDivHandle = await parentDivHandle.$('.add-job-block');
  logElementHandle(addJobBlockDivHandle, page)
  // await addJobBlockDivHandle.click();
  await Promise.all([
    page.waitForNavigation(),
    addJobBlockDivHandle.click(),
  ]);
  await addJobBlockDivHandle.dispose();
  await pageLoadDelay();
}

const fillAndSubmitNewJobForm = async (page) => {
  await page.locator('input[aria-label="Company"]')
    .setEnsureElementIsInTheViewport(false)
    .fill('test-company-3');
  await page.locator('input[aria-label="Job Title"]')
    .setEnsureElementIsInTheViewport(false)
    .fill('test-title-3');

  const parentMainModalHandle = await page.waitForSelector(`main.transparent-scrollbar.medium`);
  const saveJobHandle = await parentMainModalHandle.$('button[color="#6A4FEB"]');
  // await Promise.all([
  //   page.waitForNavigation(),
  //   saveJobHandle.click(),
  // ]);
  await pageLoadDelay();
}

const createHuntrJobPosting = async(page) => {
  findAndClickJobBlock("Coding Challenge ", page);
  fillAndSubmitNewJobForm(page);
}

// Testing - Allows me to see the raw html during the Huntr workflow
const testHuntrFlow = async (page) => {
  await loginHuntr(page);
  console.log("Successfully logged in");
  await createHuntrJobPosting(page);
  console.log("Job successfully created");

  const html = await page.content(); // After the steps in the flow, render the html
  return html;
}

// Close the app when all windows are closed on Windows and Linux
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
})

// Start the app and run it
app.whenReady().then(async () => {
  const testing = true;
  const mainWindow = createWindow(1000, 750);
  const browser = await puppeteer.launch({ headless:true });
  const page = await browser.newPage();

  let htmlToRender;
  if (testing) htmlToRender = await testHuntrFlow(page); // Production will ultimately just be a headless series of functions called on page

  mainWindow.loadURL(`data:text/html,${encodeURIComponent(htmlToRender)}`);
  mainWindow.webContents.openDevTools(); // Good for testing, might be removed in productions

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  })
})