const puppeteer = require('puppeteer');

const run = async () => {
  console.log("1")
  const browser = await puppeteer.launch({ headless:false });
  console.log("2")
    const page = await browser.newPage();
  
    // Visit page 
    await page.goto('https://jerio.me');
    const html = await page.content();
    console.log(html)
}

run();