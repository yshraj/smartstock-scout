require('dotenv').config();
const express = require('express');
const path = require('path');
const dataStore = require('./utils/dataStore');
// const scrapeService = require('./services/scrapeService'); // Commented out: Old Puppeteer scraping service
const StockNewsScraper = require('./scraper/news');
const { analyzeSentiment } = require('./ai/sentiment');

// New API-based implementations
const { getGainers, getLosers, getMostActive } = require('./apiStocks');
const { getStockNews } = require('./apiNews');

// Initialize services
const stockNewsScraper = new StockNewsScraper();
const app = express();

const cors = require('cors');

app.use(cors());

// API Endpoints
app.get('/api/stocks', async (req, res) => {
  const startTime = Date.now();
  const type = req.query.type || 'gainers';
  const refresh = req.query.refresh === 'true';

  console.log(`🌐 [GET /api/stocks] Request received - type: ${type}, refresh: ${refresh}, client: ${req.ip}`);

  try {
    // Validate stock type
    const validTypes = ['gainers', 'losers', 'most-active'];
    if (!validTypes.includes(type)) {
      console.log(`❌ [GET /api/stocks] Invalid type requested: ${type}`);
      return res.status(400).json({ error: 'Invalid stock type. Must be one of: gainers, losers, most-active' });
    }

    let stockData;
    let cacheUsed = false;
    let cacheAge = null;

    // Try to use cached data if refresh is not requested
    if (!refresh) {
      try {
        console.log(`📦 [GET /api/stocks] Checking for cached ${type} data`);
        const cachedData = await dataStore.readStockData(type);

        if (cachedData && cachedData.data && cachedData.data.length > 0) {
          const cacheTimestamp = new Date(cachedData.lastUpdated);
          const now = new Date();
          cacheAge = Math.floor((now - cacheTimestamp) / 1000 / 60); // Age in minutes

          // Use cached data if it's less than 10 minutes old
          if (cacheAge < 10) {
            stockData = cachedData.data;
            cacheUsed = true;
            console.log(`📦 [GET /api/stocks] Using cached ${type} data (${cacheAge} minutes old)`);
          } else {
            console.log(`📦 [GET /api/stocks] Cached ${type} data is too old (${cacheAge} minutes), fetching fresh data`);
          }
        } else {
          console.log(`📦 [GET /api/stocks] No cached ${type} data found, fetching fresh data`);
        }
      } catch (cacheError) {
        console.log(`📦 [GET /api/stocks] Error reading cached ${type} data:`, cacheError.message);
        console.log(`📦 [GET /api/stocks] Proceeding to fetch fresh data`);
      }
    } else {
      console.log(`🔄 [GET /api/stocks] Refresh requested, fetching fresh ${type} data`);
    }

    // Fetch fresh data if no valid cache or refresh requested
    if (!stockData) {
      console.log(`📊 [GET /api/stocks] Processing ${type} request using yahoo-finance2 API`);
      switch (type) {
        case 'gainers':
          stockData = await getGainers();
          break;
        case 'losers':
          stockData = await getLosers();
          break;
        case 'most-active':
          stockData = await getMostActive();
          break;
        default:
          stockData = await getGainers();
      }

      // Cache the fresh data
      try {
        await dataStore.writeStockData(type, stockData);
        console.log(`💾 [GET /api/stocks] Cached fresh ${type} data`);
      } catch (cacheError) {
        console.error(`❌ [GET /api/stocks] Error caching ${type} data:`, cacheError.message);
      }
    }

    const processingTime = Date.now() - startTime;
    const cacheStatus = cacheUsed ? `cached (${cacheAge}min old)` : 'fresh';

    console.log(`✅ [GET /api/stocks] Successfully returned ${stockData.length} ${type} stocks in ${processingTime}ms (${cacheStatus})`);
    console.log(`📊 [GET /api/stocks] Response sample:`, stockData.slice(0, 2).map(s => ({ symbol: s.symbol, price: s.price })));

    // Include cache status in response for debugging
    res.json({
      data: stockData,
      cache: {
        used: cacheUsed,
        age: cacheAge,
        refreshed: refresh
      }
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [GET /api/stocks] Error after ${processingTime}ms:`, error.message);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

app.get('/api/stock/:symbol', async (req, res) => {
  const startTime = Date.now();
  const symbol = req.params.symbol.toUpperCase();

  console.log(`🌐 [GET /api/stock/${symbol}] Request received - client: ${req.ip}`);

  try {
    // New API-based implementation
    console.log(`📰 [GET /api/stock/${symbol}] Fetching news using yahoo-finance2 search API`);
    const news = await getStockNews(symbol);

    const processingTime = Date.now() - startTime;
    console.log(`✅ [GET /api/stock/${symbol}] Successfully returned ${news.length} news articles in ${processingTime}ms`);
    console.log(`📰 [GET /api/stock/${symbol}] Response sample:`, news.slice(0, 2).map(n => ({
      title: n.title?.substring(0, 50) + '...',
      publisher: n.publisher
    })));

    res.json(news);
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [GET /api/stock/${symbol}] Error after ${processingTime}ms:`, error.message);
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
  const startTime = Date.now();
  const symbol = req.query.symbol?.toUpperCase();

  console.log(`🌐 [GET /api/analyze] Request received - symbol: ${symbol}, client: ${req.ip}`);

  try {
    if (!symbol) {
      console.log(`❌ [GET /api/analyze] Missing symbol parameter`);
      return res.status(400).json({ error: 'Symbol parameter is required' });
    }

    // Check cache first
    const cachedResult = getCachedAnalysis(symbol);
    if (cachedResult) {
      console.log(`📦 [GET /api/analyze] Returning cached analysis for ${symbol} (${cachedResult.length} articles)`);
      return res.json(cachedResult);
    }

    console.log(`🔍 [GET /api/analyze] Cache miss - fetching fresh news for ${symbol}`);

    // New API-based implementation
    console.log(`📰 [GET /api/analyze] Fetching news using yahoo-finance2 search API`);
    const news = await getStockNews(symbol);

    if (!news || news.length === 0) {
      console.log(`❌ [GET /api/analyze] No news found for ${symbol}`);
      return res.status(404).json({ error: 'No news found for this symbol' });
    }

    console.log(`🧠 [GET /api/analyze] Analyzing sentiment for ${news.length} articles about ${symbol}`);

    // Analyze only the first 5 articles to save API calls
    const articlesToAnalyze = news.slice(0, 5);
    console.log(`🧠 [GET /api/analyze] Processing ${articlesToAnalyze.length} articles for sentiment analysis`);

    // Process articles with controlled concurrency
    const analyzedNews = [];
    let successCount = 0;
    let errorCount = 0;

    for (const item of articlesToAnalyze) {
      try {
        // Adjusted for new API: use title and summary fields
        const textToAnalyze = `${item.title}. ${item.summary}`;
        const sentiment = await analyzeSentiment(textToAnalyze);
        analyzedNews.push({
          ...item,
          sentiment
        });
        successCount++;
      } catch (analysisError) {
        console.error(`❌ [GET /api/analyze] Sentiment analysis failed for article: ${item.title?.substring(0, 30)}...`, analysisError.message);
        // Return article without sentiment if analysis fails
        analyzedNews.push(item);
        errorCount++;
      }
    }

    console.log(`🧠 [GET /api/analyze] Sentiment analysis complete - ${successCount} successful, ${errorCount} failed`);

    // Cache the result
    setCachedAnalysis(symbol, analyzedNews);
    console.log(`📦 [GET /api/analyze] Cached analysis result for ${symbol}`);

    const processingTime = Date.now() - startTime;
    console.log(`✅ [GET /api/analyze] Successfully returned ${analyzedNews.length} analyzed articles in ${processingTime}ms`);
    console.log(`🧠 [GET /api/analyze] Response sample:`, analyzedNews.slice(0, 2).map(n => ({
      title: n.title?.substring(0, 50) + '...',
      sentiment: n.sentiment?.score || 'N/A'
    })));

    res.json(analyzedNews);
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [GET /api/analyze] Error after ${processingTime}ms:`, error.message);
    console.error(`❌ [GET /api/analyze] Error details:`, error);
    res.status(500).json({
      error: 'Analysis failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Initialize data store and start scraping at startup
const initializeServices = async () => {
  try {
    // Initialize data store first
    console.log('🔄 Initializing data store...');
    await dataStore.init();
    console.log('✅ Data store initialized');

    // Old Puppeteer scraping service - commented out to disable browser initialization:
    // await scrapeService.start();
    console.log('ℹ️  Puppeteer scraping disabled - using yahoo-finance2 API instead');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
  }
};

// Initialize services on module load
initializeServices();

// Export the app for serverless
module.exports = app;

// For local development and testing
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}
