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
const REFRESH_GRACE_PERIOD = 3 * 60 * 1000; // 3 minutes in milliseconds

// Dummy data for initial display
const dummyStocks = {
  gainers: [
    { symbol: 'AAPL', name: 'Apple Inc.', price: '$175.25', change: '+2.35%', volume: '45.2M', marketCap: '$2.75T' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: '$338.11', change: '+1.85%', volume: '32.1M', marketCap: '$2.52T' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '$138.21', change: '+1.52%', volume: '28.7M', marketCap: '$1.73T' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: '$178.22', change: '+3.21%', volume: '42.3M', marketCap: '$1.82T' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: '$122.45', change: '+4.67%', volume: '68.9M', marketCap: '$3.03T' },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: '$175.32', change: '+5.12%', volume: '125.4M', marketCap: '$558.9B' },
    { symbol: 'META', name: 'Meta Platforms Inc.', price: '$485.75', change: '+2.78%', volume: '18.9M', marketCap: '$1.23T' },
    { symbol: 'NFLX', name: 'Netflix Inc.', price: '$612.50', change: '+1.95%', volume: '5.6M', marketCap: '$267.8B' },
    { symbol: 'AMD', name: 'Advanced Micro Devices', price: '$158.75', change: '+3.42%', volume: '78.3M', marketCap: '$250.1B' },
    { symbol: 'INTC', name: 'Intel Corp.', price: '$32.45', change: '+6.78%', volume: '52.1M', marketCap: '$132.4B' }
  ],
  losers: [
    { symbol: 'WMT', name: 'Walmart Inc.', price: '$62.35', change: '-1.25%', volume: '12.4M', marketCap: '$542.1B' },
    { symbol: 'KO', name: 'The Coca-Cola Co.', price: '$63.75', change: '-0.85%', volume: '8.2M', marketCap: '$271.8B' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', price: '$152.30', change: '-0.65%', volume: '6.7M', marketCap: '$398.7B' },
    { symbol: 'XOM', name: 'Exxon Mobil Corp.', price: '$115.40', change: '-1.55%', volume: '18.9M', marketCap: '$467.2B' },
    { symbol: 'CVX', name: 'Chevron Corp.', price: '$158.60', change: '-1.22%', volume: '11.3M', marketCap: '$308.9B' },
    { symbol: 'PFE', name: 'Pfizer Inc.', price: '$28.75', change: '-2.15%', volume: '22.8M', marketCap: '$165.4B' },
    { symbol: 'BAC', name: 'Bank of America Corp.', price: '$38.45', change: '-1.78%', volume: '45.6M', marketCap: '$321.7B' },
    { symbol: 'DIS', name: 'The Walt Disney Co.', price: '$102.30', change: '-2.45%', volume: '15.7M', marketCap: '$189.6B' },
    { symbol: 'T', name: 'AT&T Inc.', price: '$18.75', change: '-1.95%', volume: '32.4M', marketCap: '$167.8B' },
    { symbol: 'F', name: 'Ford Motor Co.', price: '$12.45', change: '-3.25%', volume: '68.9M', marketCap: '$50.3B' }
  ],
  'most-active': [
    { symbol: 'TSLA', name: 'Tesla Inc.', price: '$175.32', change: '+5.12%', volume: '125.4M', marketCap: '$558.9B' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: '$122.45', change: '+4.67%', volume: '68.9M', marketCap: '$3.03T' },
    { symbol: 'AMD', name: 'Advanced Micro Devices', price: '$158.75', change: '+3.42%', volume: '78.3M', marketCap: '$250.1B' },
    { symbol: 'AAPL', name: 'Apple Inc.', price: '$175.25', change: '+2.35%', volume: '45.2M', marketCap: '$2.75T' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: '$338.11', change: '+1.85%', volume: '32.1M', marketCap: '$2.52T' },
    { symbol: 'F', name: 'Ford Motor Co.', price: '$12.45', change: '-3.25%', volume: '68.9M', marketCap: '$50.3B' },
    { symbol: 'INTC', name: 'Intel Corp.', price: '$32.45', change: '+6.78%', volume: '52.1M', marketCap: '$132.4B' },
    { symbol: 'SOFI', name: 'SoFi Technologies', price: '$8.75', change: '+8.12%', volume: '98.7M', marketCap: '$67.8B' },
    { symbol: 'NIO', name: 'NIO Inc.', price: '$5.45', change: '+4.58%', volume: '87.6M', marketCap: '$89.2B' },
    { symbol: 'PLTR', name: 'Palantir Technologies', price: '$22.35', change: '+3.25%', volume: '76.5M', marketCap: '$56.7B' }
  ]
};

// Function to check if cache is valid (less than 15 minutes old)
const isCacheValid = (timestamp) => {
  if (!timestamp) return false;
  return Date.now() - timestamp < CACHE_DURATION;
};

// Function to check if data is fresh (less than 3 minutes old)
const isDataFresh = (timestamp) => {
  if (!timestamp) return false;
  return Date.now() - timestamp < REFRESH_GRACE_PERIOD;
};

// API Endpoints
app.get('/api/stocks', async (req, res) => {
  try {
    const type = req.query.type || 'gainers';
    const forceRefresh = req.query.force === 'true';
    console.log("request recieved: "+ type);
    
    // Check if we have valid cache data
    if (stockCache[type] && isCacheValid(stockCache[type].timestamp)) {
      // If forceRefresh is requested, check if data is still fresh (within 3 minutes)
      if (forceRefresh && isDataFresh(stockCache[type].timestamp)) {
        console.log(`🔄 Data is fresh (< 3 min), skipping forced refresh for ${type}`);
        return res.json(stockCache[type].data);
      }
      
      // If forceRefresh is not requested, serve cached data
      if (!forceRefresh) {
        console.log(`📦 Serving cached data for ${type}`);
        return res.json(stockCache[type].data);
      }
    }
    
    // If cache is invalid, doesn't exist, or forceRefresh is requested for stale data, scrape new data
    // Also scrape new data if we have empty data and forceRefresh is requested
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
    // Return dummy data if scraping fails
    const type = req.query.type || 'gainers';
    console.log(`📦 Serving dummy data for ${type} due to scraping error`);
    res.json(dummyStocks[type] || []);
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

// Pre-calculate stock data at startup
const preCalculateStockData = async () => {
  const types = ['gainers', 'losers', 'most-active'];
  
  console.log('🔄 Pre-calculating stock data for all types...');
  
  for (const type of types) {
    try {
      console.log(`🌐 Scraping ${type} data...`);
      const stocks = await scraper.scrapeStocks(type);
      
      // Update cache with pre-calculated data
      stockCache[type] = {
        data: stocks,
        timestamp: Date.now()
      };
      
      console.log(`✅ Pre-calculated data for ${type} (${stocks.length} stocks)`);
    } catch (error) {
      console.error(`❌ Failed to pre-calculate ${type} data:`, error.message || error);
    }
  }
  
  console.log('✅ All stock data pre-calculated and cached');
};

// For Vercel deployments
const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`キャッシング initialized for gainers, losers, and most-active (15-minute cache)`);
  
  // Pre-calculate stock data after server starts
  setTimeout(async () => {
    await preCalculateStockData();
  }, 1000); // Small delay to ensure server is fully initialized
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
