import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

const StockTable = ({ stocks, loading, onAnalyze, scraping, stockType = 'gainers' }) => {
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
  const renderLoadingRows = () => {
    return Array.from({ length: 10 }).map((_, index) => (
      <motion.tr 
        key={index}
        className="glass table-row"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 }}
      >
        <td className="table-cell">
          <div className="loading-bar"></div>
        </td>
        <td className="table-cell">
          <div className="loading-bar loading-bar-3-4"></div>
        </td>
        <td className="table-cell">
          <div className="loading-bar loading-bar-1-2"></div>
        </td>
        <td className="table-cell">
          <div className="loading-bar loading-bar-1-3"></div>
        </td>
        <td className="table-cell">
          <div className="loading-bar loading-bar-1-4"></div>
        </td>
        <td className="table-cell">
          <div className="loading-bar loading-bar-1-3-alt"></div>
        </td>
        <td className="table-cell">
          <div className="loading-bar loading-bar-button"></div>
        </td>
      </motion.tr>
    ));
  };

  const formatChange = (change) => {
    if (!change) return 'N/A';
    const cleanChange = change.replace(/[()%]/g, '');
    return parseFloat(cleanChange);
  };

  return (
    <motion.div 
      className="glass table-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="table-wrapper">
        <table className="stock-table">
          <thead>
            <tr className="table-header">
              <th className="table-header-cell">Symbol</th>
              <th className="table-header-cell">Name</th>
              <th className="table-header-cell">Price</th>
              <th className="table-header-cell">Change</th>
              <th className="table-header-cell">Volume</th>
              <th className="table-header-cell">Market Cap</th>
              <th className="table-header-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              renderLoadingRows()
            ) : scraping ? (
              // Show dummy data when scraping
              (dummyStocks[stockType] || dummyStocks.gainers).map((stock, index) => {
                const changeValue = formatChange(stock.change);
                const isPositive = changeValue > 0;
                const isNegative = changeValue < 0;
                
                return (
                  <motion.tr 
                    key={stock.symbol}
                    className="table-row-data"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <td className="table-data symbol">{stock.symbol}</td>
                    <td className="table-data name">{stock.name}</td>
                    <td className="table-data price">{stock.price}</td>
                    <td className={`table-data change ${isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'}`}>
                      <div className="change-container">
                        {isPositive && <ArrowUpIcon className="change-icon" />}
                        {isNegative && <ArrowDownIcon className="change-icon" />}
                        {stock.change}
                      </div>
                    </td>
                    <td className="table-data volume">{stock.volume}</td>
                    <td className="table-data market-cap">{stock.marketCap}</td>
                    <td className="table-data">
                      <button
                        onClick={() => onAnalyze && onAnalyze(stock.symbol)}
                        className="btn-primary analyze-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Analyze
                      </button>
                    </td>
                  </motion.tr>
                );
              })
            ) : stocks && stocks.length > 0 ? (
              stocks.map((stock, index) => {
                const changeValue = formatChange(stock.change);
                const isPositive = changeValue > 0;
                const isNegative = changeValue < 0;
                
                return (
                  <motion.tr 
                    key={stock.symbol}
                    className="table-row-data"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <td className="table-data symbol">{stock.symbol}</td>
                    <td className="table-data name">{stock.name}</td>
                    <td className="table-data price">{stock.price}</td>
                    <td className={`table-data change ${isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'}`}>
                      <div className="change-container">
                        {isPositive && <ArrowUpIcon className="change-icon" />}
                        {isNegative && <ArrowDownIcon className="change-icon" />}
                        {stock.change}
                      </div>
                    </td>
                    <td className="table-data volume">{stock.volume}</td>
                    <td className="table-data market-cap">{stock.marketCap}</td>
                    <td className="table-data">
                      <button
                        onClick={() => onAnalyze(stock.symbol)}
                        className="btn-primary analyze-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Analyze
                      </button>
                    </td>
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  No stock data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default StockTable;
