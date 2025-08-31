// apiStocks.js
// New API-based implementation using yahoo-finance2 for stock screeners
// Old JSON-based approach is commented out for reference and fallback

const yahooFinance = require('yahoo-finance2').default;

/**
 * Helper function to map yahoo-finance2 screener quote to desired output format
 * Fields: { symbol, price, change, volume, marketCap }
 * Note: Adjustments made to keep UI compatibility with old scraper output
 */
function mapQuote(quote) {
  return {
    symbol: quote.symbol,
    price: quote.regularMarketPrice?.toString() || 'N/A',
    change: quote.regularMarketChangePercent !== undefined
      ? (quote.regularMarketChangePercent >= 0 ? '+' : '') + quote.regularMarketChangePercent.toFixed(2) + '%'
      : 'N/A',
    volume: quote.regularMarketVolume?.toLocaleString() || 'N/A',
    marketCap: quote.marketCap ? formatMarketCap(quote.marketCap) : 'N/A',
  };
}

/**
 * Format market cap number to string with suffix (B, M, K)
 */
function formatMarketCap(value) {
  if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
  if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
  return value.toString();
}

async function getGainers() {
  console.log('📊 [getGainers] Fetching day gainers from yahoo-finance2 screener API');

  try {
    // New API-based implementation using yahoo-finance2 screener (same as test.js)
    const result = await yahooFinance.screener({ scrIds: "day_gainers", count: 10 });
    const quotes = result.quotes || [];

    console.log(`📊 [getGainers] Retrieved ${quotes.length} stocks from yahoo-finance2`);
    console.log(`📊 [getGainers] Sample data:`, quotes.slice(0, 2).map(q => ({ symbol: q.symbol, price: q.regularMarketPrice })));

    const mappedData = quotes.map(mapQuote);
    console.log(`📊 [getGainers] Mapped ${mappedData.length} stocks to UI format`);

    return mappedData;
  } catch (error) {
    console.error('❌ [getGainers] Error fetching gainers:', error.message);
    throw error;
  }
}

async function getLosers() {
  console.log('📊 [getLosers] Fetching day losers from yahoo-finance2 screener API');

  try {
    // New API-based implementation using yahoo-finance2 screener (same as test.js)
    const result = await yahooFinance.screener({ scrIds: "day_losers", count: 10 });
    const quotes = result.quotes || [];

    console.log(`📊 [getLosers] Retrieved ${quotes.length} stocks from yahoo-finance2`);
    console.log(`📊 [getLosers] Sample data:`, quotes.slice(0, 2).map(q => ({ symbol: q.symbol, price: q.regularMarketPrice })));

    const mappedData = quotes.map(mapQuote);
    console.log(`📊 [getLosers] Mapped ${mappedData.length} stocks to UI format`);

    return mappedData;
  } catch (error) {
    console.error('❌ [getLosers] Error fetching losers:', error.message);
    throw error;
  }
}

async function getMostActive() {
  console.log('📊 [getMostActive] Fetching most active stocks from yahoo-finance2 screener API');

  try {
    // New API-based implementation using yahoo-finance2 screener (same as test.js)
    const result = await yahooFinance.screener({ scrIds: "most_actives", count: 10 });
    const quotes = result.quotes || [];

    console.log(`📊 [getMostActive] Retrieved ${quotes.length} stocks from yahoo-finance2`);
    console.log(`📊 [getMostActive] Sample data:`, quotes.slice(0, 2).map(q => ({ symbol: q.symbol, price: q.regularMarketPrice })));

    const mappedData = quotes.map(mapQuote);
    console.log(`📊 [getMostActive] Mapped ${mappedData.length} stocks to UI format`);

    return mappedData;
  } catch (error) {
    console.error('❌ [getMostActive] Error fetching most active:', error.message);
    throw error;
  }
}

module.exports = {
  getGainers,
  getLosers,
  getMostActive,
};
