const puppeteer = require('puppeteer');

async function scrapeStocks(type = 'gainers') {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  
  try {
    await page.goto(`https://finance.yahoo.com/${type}`, { 
        waitUntil: 'load',
        timeout: 10000 
    });
  } catch (e) {
    console.log('Not able to crawl.');
  }

  // Accept cookies if popup appears
  try {
    await page.click('button[type="submit"]');
  } catch (e) {
    console.log('No cookie popup');
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
    }).filter(stock => stock.symbol); // only return rows with valid symbols
  });  

  await browser.close();
  return data.slice(0, 20); // Return top 20 stocks
}

module.exports = { scrapeStocks };