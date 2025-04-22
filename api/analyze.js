require('dotenv').config();
const { scrapeStockNews } = require('../scraper/news');
const { analyzeSentiment } = require('../ai/sentiment');

module.exports = async (req, res) => {
  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'Symbol parameter is required' });
  }

  try {
    const news = await scrapeStockNews(symbol);

    if (!news || news.length === 0) {
      return res.status(404).json({ error: 'No news found for this symbol' });
    }

    const articlesToAnalyze = news.slice(0, 5);
    const analyzedNews = await Promise.all(
      articlesToAnalyze.map(async (item) => {
        try {
          const sentiment = await analyzeSentiment(`${item.headline}. ${item.summary}`);
          return { ...item, sentiment };
        } catch (analysisError) {
          console.error(`Analysis failed for: ${item.headline}`, analysisError);
          return item;
        }
      })
    );

    res.status(200).json(analyzedNews);
  } catch (error) {
    console.error('Analysis endpoint error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
