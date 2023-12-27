const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const {
  goToPage,
  createWindow,
  clickAndWaitForRedirect,
  pageLoadDelay,
} = require("./utils");
const config = require("./config");
const huntrEmail = process.env.HUNTR_EMAIL;
const huntrPassword = process.env.HUNTR_PASSWORD;
const jobs = require("./jobs");
const { app, BrowserWindow, ipcMain } = require('electron');
const puppeteer = require('puppeteer');

// Login to Huntr at 'https://huntr.co/login'
// Go to the page, fill the fields, submit, wait for 2 seconds
const loginHuntr = async (page) => {
  await goToPage(config.huntrGoalsDashboardUrl, page);
  await page.locator('input[type="email"]')
    .setEnsureElementIsInTheViewport(false)
    .fill(huntrEmail);
  await page.locator('input[type="password"]')
    .setEnsureElementIsInTheViewport(false)
    .fill(huntrPassword);
  await clickAndWaitForRedirect('button[color="#6A4FEB"]', page);
  await pageLoadDelay(2000);
}

// Find and open a specific job board
const findAndClickJobBlock = async (jobBlockTitle, page) => {
  const parentDivHandle = await page.waitForSelector(`.list-container.transparent-scrollbar.small:has(input[value="${jobBlockTitle}"])`);
  const addJobBlockDivHandle = await parentDivHandle.$('.add-job-block');
  await addJobBlockDivHandle.click();
  await parentDivHandle.dispose();
  await addJobBlockDivHandle.dispose();
  await pageLoadDelay();
}

// Fill and submit the required job info on the form
const fillRequiredJobInfoAndSubmit = async (page, job) => {
  await page.locator('input[aria-label="Company"]')
    .setEnsureElementIsInTheViewport(false)
    .fill(job.company);

  await pageLoadDelay(100);

  await page.locator('h1[title="Add Job"]')
    .setEnsureElementIsInTheViewport(false)
    .click();
  
  await pageLoadDelay(100);

  await page.locator('input[aria-label="Job Title"]')
    .setEnsureElementIsInTheViewport(false)
    .fill(job.title);

  const parentMainModalHandle = await page.waitForSelector(`main.transparent-scrollbar.medium`);
  const saveJobHandle = await parentMainModalHandle.$('button[color="#6A4FEB"]');

  await Promise.all([
    page.waitForNavigation(),
    saveJobHandle.click(),
  ]);
  await saveJobHandle.dispose();
  await parentMainModalHandle.dispose();
  await pageLoadDelay();
}

// Fill and submit additional job info, then close the form
const fillAdditionalJobInfoAndClose = async (page, job) => {
  if (job.url?.length) {
    await page.locator('input[placeholder="+ add URL"]')
    .setEnsureElementIsInTheViewport(false)
    .fill(job.url);
  };

  if (job.description?.length) {
    await page.locator('div[contenteditable="true"]')
    .setEnsureElementIsInTheViewport(false)
    .fill(job.description);
  };

  await page.locator('button[color="white"]')
    .setEnsureElementIsInTheViewport(false)
    .click();
  await pageLoadDelay();
}

// Fills out and submits job form with supplied job
const fillSubmitAndCloseNewJob = async (page, job) => {
  await fillRequiredJobInfoAndSubmit(page, job);
  await fillAdditionalJobInfoAndClose(page, job);
}

// Re-usable function for creating Huntr jobs from the job dashboard
const createHuntrJobPosting = async (page, job = jobs[Object.keys(jobs)[0]]) => {
  await findAndClickJobBlock("Applied", page);
  await fillSubmitAndCloseNewJob(page, job);
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
  const mainWindow = createWindow(1000, 750);
  mainWindow.loadFile('index.html');

  const browser = await puppeteer.launch({ headless:true });
  const page = await browser.newPage();

  let htmlToRender;
  if (config.testing) htmlToRender = await testHuntrFlow(page); // If testing, renders the html from Puppeteer

  mainWindow.loadURL(`data:text/html,${encodeURIComponent(htmlToRender)}`);
  mainWindow.webContents.openDevTools(); // Good for testing, might be removed in productions

  // Create a window if there are none on Mac
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  })
})