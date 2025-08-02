require('dotenv').config();
const express = require('express');
const PuppeteerScraper = require('./scraper/yahoo');
const scraper = new PuppeteerScraper();

const StockNewsScraper = require('./scraper/news');
const stockNewsScraper = new StockNewsScraper();

const { analyzeSentiment } = require('./ai/sentiment');

const app = express();
const path = require('path');

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

const cors = require('cors');

app.use(cors());

// Cache implementation
const stockCache = {
  gainers: {
    data: null,
    timestamp: null
  },
  losers: {
    data: null,
    timestamp: null
  },
  'most-active': {
    data: null,
    timestamp: null
  }
};

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// Function to check if cache is valid (less than 15 minutes old)
const isCacheValid = (timestamp) => {
  if (!timestamp) return false;
  return Date.now() - timestamp < CACHE_DURATION;
};

// API Endpoints
app.get('/api/stocks', async (req, res) => {
  try {
    const type = req.query.type || 'gainers';
    const forceRefresh = req.query.force === 'true';
    console.log("request recieved: "+ type);
    
    // Check if we have valid cache data and forceRefresh is not requested
    if (!forceRefresh && stockCache[type] && isCacheValid(stockCache[type].timestamp)) {
      console.log(`📦 Serving cached data for ${type}`);
      return res.json(stockCache[type].data);
    }
    
    // If cache is invalid, doesn't exist, or forceRefresh is requested, scrape new data
    console.log(`🌐 Scraping new data for ${type}${forceRefresh ? ' (forced)' : ''}`);
    const stocks = await scraper.scrapeStocks(type);
    
    // Update cache with new data
    stockCache[type] = {
      data: stocks,
      timestamp: Date.now()
    };
    
    res.json(stocks);
  } catch (error) {
    console.error('Scraping error:', error.message || error);
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

    // Analyze only the first 5 articles to save API calls
    const articlesToAnalyze = news.slice(0, 5);
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
  console.log(`キャッシング initialized for gainers, losers, and most-active (15-minute cache)`);
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

// Serve the React app for any unmatched routes
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
