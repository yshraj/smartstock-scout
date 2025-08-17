const PuppeteerScraper = require('../scraper/yahoo');
const dataStore = require('../utils/dataStore');

class ScrapeService {
    constructor() {
        this.scraper = new PuppeteerScraper();
        this.isRunning = false;
        this.interval = null;
    }

    async start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('🚀 Starting scrape service');
        
        // Initial scrape
        await this.scrapeAll();
        
        // Set up interval (20 minutes)
        this.interval = setInterval(async () => {
            await this.scrapeAll();
        }, 20 * 60 * 1000);
    }

    async stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        
        await this.scraper.closeBrowser();
        console.log('🛑 Scrape service stopped');
    }

    async scrapeAll() {
        console.log('🔄 Starting scheduled scrape:', new Date().toISOString());
        
        const types = ['gainers', 'losers', 'most-active'];
        for (const type of types) {
            try {
                console.log(`📊 Scraping ${type}...`);
                const data = await this.scraper.scrapeStocks(type);
                await dataStore.writeStockData(type, data);
                console.log(`✅ Successfully updated ${type} data`);
            } catch (error) {
                console.error(`❌ Failed to scrape ${type}:`, error);
                // On error, the UI will still use existing JSON data
            }
        }
        
        console.log('✅ Scheduled scrape completed:', new Date().toISOString());
    }
}

module.exports = new ScrapeService();
