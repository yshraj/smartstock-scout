require('dotenv').config();
const express = require('express');
const path = require('path');
const dataStore = require('./utils/dataStore');
const scrapeService = require('./services/scrapeService');
const StockNewsScraper = require('./scraper/news');
const { analyzeSentiment } = require('./ai/sentiment');

// Initialize services
const stockNewsScraper = new StockNewsScraper();
const app = express();

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

const cors = require('cors');

app.use(cors());

// API Endpoints
app.get('/api/stocks', async (req, res) => {
  try {
    const type = req.query.type || 'gainers';
    
    // Validate stock type
    const validTypes = ['gainers', 'losers', 'most-active'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid stock type. Must be one of: gainers, losers, most-active' });
    }

    console.log(`📊 Fetching ${type} data from storage`);
    const stockData = await dataStore.readStockData(type);
    res.json(stockData.data);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
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

// Cache for analyzed news results
const analysisCache = new Map();
const ANALYSIS_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function getCachedAnalysis(symbol) {
  const cached = analysisCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < ANALYSIS_CACHE_DURATION) {
    console.log(`📦 Using cached analysis for ${symbol}`);
    return cached.data;
  }
  return null;
}

function setCachedAnalysis(symbol, data) {
  analysisCache.set(symbol, {
    data,
    timestamp: Date.now()
  });
}

// Enhanced analyze endpoint
app.get('/api/analyze', async (req, res) => {
  try {
    if (!req.query.symbol) {
      return res.status(400).json({ error: 'Symbol parameter is required' });
    }

    const symbol = req.query.symbol.toUpperCase();
    
    // Check cache first
    const cachedResult = getCachedAnalysis(symbol);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    console.log(`🔍 Fetching news for ${symbol}`);
    const news = await stockNewsScraper.scrapeNews(symbol);
    
    if (!news || news.length === 0) {
      return res.status(404).json({ error: 'No news found for this symbol' });
    }

    console.log(`🧠 Analyzing sentiment for ${news.length} articles about ${symbol}`);
    
    // Analyze only the first 5 articles to save API calls
    const articlesToAnalyze = news.slice(0, 5);
    
    // Process articles with controlled concurrency
    const analyzedNews = [];
    for (const item of articlesToAnalyze) {
      try {
        const textToAnalyze = `${item.headline}. ${item.summary}`;
        const sentiment = await analyzeSentiment(textToAnalyze);
        analyzedNews.push({
          ...item,
          sentiment
        });
      } catch (analysisError) {
        console.error(`Analysis failed for article: ${item.headline}`, analysisError);
        // Return article without sentiment if analysis fails
        analyzedNews.push(item);
      }
    }

    // Cache the result
    setCachedAnalysis(symbol, analyzedNews);
    
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

// Initialize data store and start scraping at startup
const initializeServices = async () => {
  try {
    // Initialize data store first
    console.log('🔄 Initializing data store...');
    await dataStore.init();
    console.log('✅ Data store initialized');

    // Start scraping service
    await scrapeService.start();
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
  }
};

// Start server and initialize services
const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize services
  await initializeServices();
});

// Handle shutdown gracefully
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down...');
  
  // Stop scraping service
  await scrapeService.stop();
  
  // Close server
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
