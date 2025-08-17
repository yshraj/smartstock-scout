import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import StockTable from './components/StockTable';
import NewsPanel from './components/NewsPanel';
import Sidebar from './components/Sidebar';
import { fetchStocks, fetchStockAnalysis } from './utils/api';
import { motion } from 'framer-motion';

function App() {
  const [stockType, setStockType] = useState('gainers');
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const newsPanelRef = useRef(null);

  const handleFetchStocks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStocks(stockType);
      setStocks(data);
    } catch (err) {
      setError('Failed to fetch stocks. Please try again.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeStock = async (symbol) => {
    setSelectedStock(symbol);
    setNewsData([]);
    
    try {
      const data = await fetchStockAnalysis(symbol);
      setNewsData(data);
    } catch (err) {
      setError('Failed to analyze stock. Please try again.');
      console.error('Analysis error:', err);
    }
  };

  // Effect to scroll to news panel when selectedStock changes
  useEffect(() => {
    if (selectedStock) {
      // Scroll to the news panel after a short delay to ensure it's rendered
      const scrollTimer = setTimeout(() => {
        if (newsPanelRef.current) {
          newsPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      
      return () => clearTimeout(scrollTimer);
    }
  }, [selectedStock]);

  useEffect(() => {
    handleFetchStocks();
  }, [stockType]);

  return (
    <div className="app-container">
      <div className="app-content">
        {/* Header */}
        <Header onRefresh={handleFetchStocks} loading={loading} />
        
        <div className="app-main">
          {/* Main Content */}
          <div className="main-content">
            {/* Controls */}
            <motion.div 
              className="glass controls-container"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="controls-content">
                <h2 className="controls-title">
                  {stockType === 'gainers' && '📈 Top Gainers'}
                  {stockType === 'losers' && '📉 Top Losers'}
                  {stockType === 'most-active' && '🔥 Most Active'}
                </h2>
                
                <div className="controls-buttons">
                  <select 
                    value={stockType}
                    onChange={(e) => setStockType(e.target.value)}
                    className="controls-select"
                    disabled={loading}
                  >
                    <option value="gainers">Top Gainers</option>
                    <option value="losers">Top Losers</option>
                    <option value="most-active">Most Active</option>
                  </select>
                  
                  <button
                    onClick={handleFetchStocks}
                    disabled={loading}
                    className="btn-primary controls-refresh-btn"
                  >
                    {loading ? (
                      <>
                        <span className="controls-loading-spinner"></span>
                        Loading...
                      </>
                    ) : (
                      'Refresh View'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
            
            {/* Error Message */}
            {error && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {error}
              </motion.div>
            )}
            
            {/* Stock Table */}
            <StockTable 
              stocks={stocks} 
              loading={loading}
              onAnalyze={handleAnalyzeStock}
            />
            
            {/* News Panel */}
            {selectedStock && (
              <motion.div
                ref={newsPanelRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <NewsPanel 
                  symbol={selectedStock}
                  newsData={newsData}
                  loading={!newsData.length && selectedStock}
                />
              </motion.div>
            )}
          </div>
          
          {/* Sidebar */}
          <Sidebar 
            stockType={stockType}
            setStockType={setStockType}
            onFetchStocks={handleFetchStocks}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
