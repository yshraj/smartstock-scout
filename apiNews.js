// apiNews.js
// New API-based implementation using yahoo-finance2 for stock news
// Old Puppeteer-based Yahoo news scraper is commented out for reference and fallback

const yahooFinance = require('yahoo-finance2').default;

/**
 * Get stock news using yahoo-finance2 search API
 * Returns top 3 articles with fields: { title, summary (or fallback to title), link, published, publisher }
 * Note: yahoo-finance2 may not always provide summaries, so fallback to title if missing
 * UI Impact: Display title as fallback summary in frontend
 */
async function getStockNews(symbol) {
  console.log(`📰 [getStockNews] Fetching news for symbol: ${symbol} from yahoo-finance2 search API`);

  try {
    const queryOptions = {
      newsCount: 3, // Get top 3 articles
    };

    console.log(`📰 [getStockNews] Calling yahoo-finance2.search with options:`, queryOptions);
    const result = await yahooFinance.search(symbol, queryOptions);
    const news = result.news || [];

    console.log(`📰 [getStockNews] Retrieved ${news.length} news articles from yahoo-finance2`);
    console.log(`📰 [getStockNews] Sample articles:`, news.slice(0, 2).map(a => ({
      title: a.title?.substring(0, 50) + '...',
      publisher: a.publisher
    })));

    const mappedNews = news.slice(0, 3).map(article => ({
      title: article.title || 'No title',
      summary: article.summary || article.title || 'No summary available', // Fallback to title if summary missing
      link: article.link || '',
      published: article.providerPublishTime ? new Date(article.providerPublishTime * 1000).toISOString() : 'N/A',
      publisher: article.publisher || 'Unknown',
    }));

    console.log(`📰 [getStockNews] Mapped ${mappedNews.length} articles to UI format`);
    console.log(`📰 [getStockNews] Articles with missing summaries: ${mappedNews.filter(a => a.summary === 'No summary available').length}`);

    return mappedNews;
  } catch (error) {
    console.error(`❌ [getStockNews] Error fetching news for ${symbol}:`, error.message);
    console.error(`❌ [getStockNews] Error details:`, error);
    return [];
  }
}

module.exports = {
  getStockNews,
};
