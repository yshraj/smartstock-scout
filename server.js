require('dotenv').config();
const express = require('express');
const PuppeteerScraper = require('./scraper/yahoo');
const scraper = new PuppeteerScraper();

const StockNewsScraper = require('./scraper/news');
const stockNewsScraper = new StockNewsScraper();

const { analyzeSentiment } = require('./ai/sentiment');

const app = express();
app.use(express.static('public'));

const cors = require('cors');

app.use(cors());

// API Endpoints
app.get('/api/stocks', async (req, res) => {
  try {
    console.log("request recieved: "+ req.query.type);
    const stocks = await scraper.scrapeStocks(req.query.type || 'gainers');
    res.json(stocks);
  } catch (error) {
    console.error('Scraping error:', err.message || err);
    res.status(500).json({ error: 'Scraping failed' });
  }
});

app.get('/api/stock/:symbol', async (req, res) => {
  try {
    const news = await stockNewsScraper.scrapeNews(req.params.symbol);
    
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: 'Data fetch failed' });
  }
});

// Enhanced analyze endpoint
app.get('/api/analyze', async (req, res) => {
  try {
    if (!req.query.symbol) {
      return res.status(400).json({ error: 'Symbol parameter is required' });
    }

    const news = await stockNewsScraper.scrapeNews(req.query.symbol);
    
    if (!news || news.length === 0) {
      return res.status(404).json({ error: 'No news found for this symbol' });
    }

    // Analyze only the first 3 articles to save API calls
    const articlesToAnalyze = news.slice(0, 3);
    const analyzedNews = await Promise.all(
      articlesToAnalyze.map(async item => {
        try {
          const sentiment = await analyzeSentiment(`${item.headline}. ${item.summary}`);
          return {
            ...item,
            sentiment
          };
        } catch (analysisError) {
          console.error(`Analysis failed for article: ${item.headline}`, analysisError);
          return item; // Return article without sentiment if analysis fails
        }
      })
    );

    res.json(analyzedNews);
  } catch (error) {
    console.error('Analysis endpoint error:', error);
    res.status(500).json({ 
      error: 'Analysis failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

const PORT = process.env.PORT || 3000;

// For Vercel deployments
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Error handling for EADDRINUSE (common during development)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
  throw err;
});