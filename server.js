require('dotenv').config();
const express = require('express');
const { scrapeStocks } = require('./scraper/yahoo');
const { scrapeStockNews } = require('./scraper/news');
const { analyzeSentiment } = require('./ai/sentiment');

const app = express();
app.use(express.static('public'));

const cors = require('cors');
// Enhanced CORS configuration
const allowedOrigins = [
  'https://smartstock-scout-*.vercel.app',
  'https://smartstock-scout.vercel.app',
  'http://localhost:3000'
];


app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowedOrigin => 
      origin.includes(allowedOrigin.replace('*', ''))
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true
}));

// API Endpoints
app.get('/api/stocks', async (req, res) => {
  try {
    const stocks = await scrapeStocks(req.query.type || 'gainers');
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: 'Scraping failed' });
  }
});

app.get('/api/stock/:symbol', async (req, res) => {
  try {
    const news = await scrapeStockNews(req.params.symbol);
    
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

    const news = await scrapeStockNews(req.query.symbol);
    
    if (!news || news.length === 0) {
      return res.status(404).json({ error: 'No news found for this symbol' });
    }

    // Analyze only the first 3 articles to save API calls
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));