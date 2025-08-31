// scraper/StockNewsScraper.js
// Old scraper reference: This Puppeteer-based news scraper is commented out for reference and fallback
// New implementation uses yahoo-finance2 API in apiNews.js

// const puppeteer = require('puppeteer');
// require("dotenv").config();

class StockNewsScraper {
  constructor() {
    // this.browserPromise = this.initBrowser();
    console.log('ℹ️  StockNewsScraper disabled - using yahoo-finance2 API instead');
  }

  // async initBrowser() {
  //   if (!this.browser) {
  //     this.browser = await puppeteer.launch({
  //       args: [
  //         "--disable-setuid-sandbox",
  //         "--no-sandbox",
  //         "--single-process",
  //         "--no-zygote",
  //       ]
  //     });
  //     console.log('🧠 Browser initialized for news scraping');
  //   }
  //   return this.browser;
  // }

  // async scrapeNews(symbol, maxRetries = 2) {
  //   const browser = await this.browserPromise;
  //   const page = await browser.newPage();
  //   await page.setUserAgent(
  //     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  //   );

  //   try {
  //     console.log(`🔍 Navigating to Yahoo Finance news for ${symbol}...`);
  //     await page.goto(`https://finance.yahoo.com/quote/${symbol}/news`, {
  //       waitUntil: 'domcontentloaded',
  //       timeout: 30000, // Increased timeout to 30 seconds
  //     });

  //     const news = await page.evaluate(() => {
  //       const items = [];
  //       document.querySelectorAll('ul.stream-items li').forEach(item => {
  //         try {
  //           items.push({
  //             headline: item.querySelector('h3')?.textContent?.trim() || 'No headline',
  //             summary: item.querySelector('p')?.textContent?.trim() || '',
  //             time: item.querySelector('div > div:nth-child(2) > div')?.textContent?.trim() || 'N/A',
  //             url: item.querySelector('a')?.href || '',
  //           });
  //         } catch (e) {
  //           console.error('Error parsing news item', e);
  //         }
  //       });
  //       return items;
  //     });

  //     await page.close();
  //     return news.filter(item => item.headline !== 'No headline').slice(0, 10);

  //   } catch (error) {
  //     await page.close();
  //     if (maxRetries > 0) {
  //       console.log(`Retrying news scrape for ${symbol}... (${maxRetries} retries left)`);
  //       return this.scrapeNews(symbol, maxRetries - 1);
  //     }
  //     console.error(`❌ Failed to scrape news for ${symbol}:`, error.message);
  //     return [];
  //   }
  // }

  // async closeBrowser() {
  //   if (this.browser) {
  //     const browser = await this.browserPromise;
  //     await browser.close();
  //     console.log('🛑 Browser closed');
  //   }
  // }
}

module.exports = StockNewsScraper;
