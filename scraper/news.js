const puppeteer = require('puppeteer');

async function scrapeStockNews(symbol, maxRetries = 2) {
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Set timeout for navigation
    await page.goto(`https://finance.yahoo.com/quote/${symbol}/news`, {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });

    // Handle cookie consent if it appears
    try {
      await page.click('button[type="submit"][value="agree"]', { timeout: 3000 });
    } catch (e) {
      // Cookie consent not found, continue
    }

    const news = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll('ul.stream-items li').forEach(item => {
        try {
          items.push({
            headline: item.querySelector('h3')?.textContent?.trim() || 'No headline',
            summary: item.querySelector('p')?.textContent?.trim() || '',
            time: item.querySelector('div > div:nth-child(2) > div')?.textContent?.trim() || 'N/A',
            url: item.querySelector('a')?.href || ''
          });
        } catch (e) {
          console.error('Error parsing news item', e);
        }
      });
      return items;
    });

    return news.filter(item => item.headline !== 'No headline').slice(0, 10);
  } catch (error) {
    if (maxRetries > 0) {
      console.log(`Retrying... (${maxRetries} attempts left)`);
      return scrapeStockNews(symbol, maxRetries - 1);
    }
    logError('News scraping failed', { symbol, error });
    throw new Error(`Failed to scrape news for ${symbol}`);
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { scrapeStockNews };