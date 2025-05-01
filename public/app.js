document.addEventListener('DOMContentLoaded', () => {
  const fetchBtn = document.getElementById('fetchBtn');
  const stockType = document.getElementById('stockType');
  const stockTable = document.getElementById('stockTable').querySelector('tbody');
  
  const loadingPhrases = [
    "Scanning market sentiments...",
    "Gathering analyst opinions...",
    "Evaluating financial reports...",
    "Decoding investor mood swings...",
    "Crunching the latest stock news...",
    "Reading Reddit & Twitter buzz...",
    "Looking into macroeconomic trends...",
    "Tracking insider activity...",
    "Cross-referencing AI predictions...",
    "Measuring volatility impact...",
    "Assessing technical indicators...",
    "Detecting unusual trading volumes...",
    "Consulting Wall Street whispers...",
    "Parsing quarterly earnings...",
    "Synthesizing historical data...",
    "Projecting growth patterns...",
    "Looking at global financial shifts...",
    "Reading between the headlines...",
    "Analyzing investor behavior...",
    "Checking institutional moves...",
    "Modeling risk-reward ratios...",
    "Reviewing P/E fluctuations...",
    "Studying moving averages...",
    "Watching market reaction times...",
    "Mapping sentiment clusters...",
    "Exploring economic sentiment shifts...",
    "Weighing in market pulse...",
    "Scanning AI forecasting models...",
    "Assessing supply chain pressure...",
    "Getting smarter... 🧠"
  ];
  
  fetchBtn.addEventListener('click', fetchStocks);

  const hostname = window?.location?.hostname || '';

  const API_BASE_URL = hostname === ''
    ? 'http://localhost:3000'
    //: 'https://smartstock-scout.onrender.com';
    : 'https://smartstock-scout-production.up.railway.app/';

  async function fetchStocks() {
    try {
      fetchBtn.disabled = true;
      fetchBtn.textContent = 'Loading...'; // Change button text during loading
      // Show a random loading message
      const randomMessage = loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)];
      const loadingMessageElement = document.getElementById('loadingMessage');
      loadingMessageElement.textContent = randomMessage;
      loadingMessageElement.classList.remove('hidden'); // Make it visible
  
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
    } finally {
      fetchBtn.disabled = false;
      fetchBtn.textContent = 'Get Stocks'; // Reset button text
      document.getElementById('loadingMessage').classList.add('hidden'); // Hide the loading message
    }
  }
    
  window.showStockDetails = async (symbol) => {
    try {
      const detailsSection = document.getElementById('stockDetails');
      detailsSection.classList.remove('hidden');
      document.getElementById('detailSymbol').textContent = `${symbol} - Loading...`;
      document.getElementById('newsContainer').innerHTML = '<div class="loading">Analyzing news...</div>';
  
      // Smooth scroll to details section
      setTimeout(() => {
        detailsSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100); // slight delay ensures content is rendered

      const analyzedNews = await axios.get(`${API_BASE_URL}/api/analyze?symbol=${symbol}`);
  
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