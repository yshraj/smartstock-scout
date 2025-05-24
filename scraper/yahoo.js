// scraper/PuppeteerScraper.js
const puppeteer = require('puppeteer');
require("dotenv").config();

class PuppeteerScraper {
  constructor() {
    this.browserPromise = this.init(); // 👈 starts the browser when class is created
  }

  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        args: [
          "--disable-setuid-sandbox",
          "--no-sandbox",
          "--single-process",
          "--no-zygote",
        ]
      });
      console.log('✅ Puppeteer browser initialized');
    }
    return this.browser;
  }

  async scrapeStocks(type = 'gainers') {
    const browser = await this.browser;
    const page = await browser.newPage();
    console.log('🟢 New page opened');

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    try {
      await page.goto(`https://finance.yahoo.com/${type}`, {
        waitUntil: 'load',
        timeout: 5000,
      });
    } catch (e) {
    }

    // Handle cookie popup
    try {
      await page.click('button[type="submit"]');
    } catch (e) {
      console.log('🔸 No cookie popup');
    }

    const data = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('tr')).map(row => {
        const symbolEl = row.querySelector('td:nth-child(1) a');
        const nameEl = row.querySelector('td:nth-child(2)');
        const priceEl = row.querySelector('td:nth-child(4) fin-streamer');
        const changeEl = row.querySelector('td:nth-child(6) fin-streamer');
        const volumeEl = row.querySelector('td:nth-child(7) fin-streamer');
        const marketCapEl = row.querySelector('td:nth-child(9) fin-streamer');

        return {
          symbol: symbolEl?.textContent.trim() || null,
          name: nameEl?.textContent.trim() || null,
          price: priceEl?.textContent.trim() || null,
          change: changeEl?.textContent.trim() || null,
          volume: volumeEl?.textContent.trim() || null,
          marketCap: marketCapEl?.textContent.trim() || null,
        };
      }).filter(stock => stock.symbol);
    });

    await page.close();
    return data.slice(0, 20);
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      console.log('🛑 Browser closed');
    }
  }
}

module.exports = PuppeteerScraper;
