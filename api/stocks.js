const { scrapeStocks } = require('../scraper/yahoo');

module.exports = async (req, res) => {
  try {
    const { type = 'gainers' } = req.query;
    const stocks = await scrapeStocks(type);
    res.status(200).json(stocks);
  } catch (error) {
    res.status(500).json({ error: 'Scraping failed' });
  }
};
