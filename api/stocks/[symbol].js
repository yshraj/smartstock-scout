const { scrapeStockNews } = require('../../scraper/news');

module.exports = async (req, res) => {
  const {
    query: { symbol }
  } = req;

  if (!symbol) {
    return res.status(400).json({ error: 'Symbol parameter is required' });
  }

  try {
    const news = await scrapeStockNews(symbol);
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: 'Data fetch failed' });
  }
};
