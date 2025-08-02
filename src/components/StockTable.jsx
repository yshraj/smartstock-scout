import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

const StockTable = ({ stocks, loading, onAnalyze }) => {
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
