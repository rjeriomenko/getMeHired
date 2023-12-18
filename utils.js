const config = require("./config");
const { BrowserWindow } = require('electron');

// Artificial delay, in milliseconds
const pageLoadDelay = async (delayInMilliseconds = config.pageLoadDelayAmount) => {
	await new Promise(r => setTimeout(r, delayInMilliseconds));
}

// Create default electron window
const createWindow = (width, height) => {
  const win = new BrowserWindow({
    width,
    height,
    webPreferences: {
      devTools: true,
    },
  });

 return win;
}

// Go to page and apply default page load delay
const goToPage = async (url, page) => {
  await page.goto(url);
  await pageLoadDelay();
  return page;
}

// Visit page and run optional function before returning the page html
const goToAndProcessPageHtml = async (url, page, preReturnFunction = null) => {
  const targetPage = await goToPage(url, page);
  const functionedPage = preReturnFunction ? await preReturnFunction(targetPage) : targetPage;
  const html = await functionedPage.content();
  return html;
}

// Click on the selector element and wait to be redirected. Allows multiple redirects
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

// Log an elementHandle's html
const logElementHandle = async (elementHandle, page) => {
	const elementHtml = await page.evaluate(element => element.outerHTML, elementHandle); // Convert elementHandle into html
  console.log(elementHtml);
}

module.exports = { 
	pageLoadDelay,
	createWindow,
	goToPage,
	goToAndProcessPageHtml,
	clickAndWaitForRedirect,
	logElementHandle,
}