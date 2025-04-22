document.addEventListener('DOMContentLoaded', () => {
  const fetchBtn = document.getElementById('fetchBtn');
  const stockType = document.getElementById('stockType');
  const stockTable = document.getElementById('stockTable').querySelector('tbody');
  
  fetchBtn.addEventListener('click', fetchStocks);

  const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://smartstock-scout-hzqvl1rdm-yash-s-projects-098778ca.vercel.app';

  async function fetchStocks() {
    try {
      fetchBtn.disabled = true;
      fetchBtn.textContent = 'Loading...';

      const response = await axios.get(`${API_BASE_URL}/api/stocks?type=${stockType.value}`);
      const stocks = await response.data;
      
      stockTable.innerHTML = stocks.map(stock => `
        <tr>
          <td>${stock.symbol}</td>
          <td>${stock.name}</td>
          <td>${stock.price}</td>
          <td class="${stock.change.includes('+') ? 'positive' : 'negative'}">
            ${stock.change}
          </td>
          <td><button onclick="showStockDetails('${stock.symbol}')">Analyze</button></td>
        </tr>
      `).join('');
    } catch (error) {
      console.error('Fetch error:', error);
      showError('Failed to fetch stocks. Please try again later.');
    }finally {
      fetchBtn.disabled = false;
      fetchBtn.textContent = 'Get Stocks';
    }
  }

  window.showStockDetails = async (symbol) => {
    try {
      // Show loading state
      const detailsSection = document.getElementById('stockDetails');
      detailsSection.classList.remove('hidden');
      document.getElementById('detailSymbol').textContent = `${symbol} - Loading...`;
      document.getElementById('newsContainer').innerHTML = '<div class="loading">Analyzing news...</div>';
      
      // Fetch both basic info and analyzed news
      const [basicInfo, analyzedNews] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/stock/${symbol}`),
        axios.get(`${API_BASE_URL}/api/analyze?symbol=${symbol}`)
      ]);
      
      // Display results
      document.getElementById('detailSymbol').textContent = symbol;
      renderNews(analyzedNews.data);
    } catch (error) {
      console.error('Analysis error:', error);
      showError('Failed to analyze stock news. Please try again.');
    }
  };
  
  function renderNews(newsItems) {
    const newsContainer = document.getElementById('newsContainer');
    
    if (!newsItems || newsItems.length === 0) {
      newsContainer.innerHTML = '<div class="no-news">No news found for this stock</div>';
      return;
    }
    
    newsContainer.innerHTML = newsItems.map(item => `
      <div class="news-item ${item.sentiment?.label?.toLowerCase() || ''}">
        <h3>${item.headline}</h3>
        ${item.sentiment ? `
          <div class="sentiment-badge">
            ${item.sentiment.label} (${Math.round(item.sentiment.score * 100)}%)
          </div>
        ` : ''}
        <p>${item.summary}</p>
        <small>${item.time}</small>
      </div>
    `).join('');
  }
  
  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Remove any existing errors
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    
    document.querySelector('.container').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }
});