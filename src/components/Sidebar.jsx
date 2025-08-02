import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Sidebar = ({ stockType, setStockType, onFetchStocks }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const categories = [
    { id: 'gainers', label: '📈 Top Gainers', color: 'gainers' },
    { id: 'losers', label: '📉 Top Losers', color: 'losers' },
    { id: 'most-active', label: '🔥 Most Active', color: 'active' }
  ];

  return (
    <div className="sidebar-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="glass sidebar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="sidebar-title">Stock Categories</h3>
            
            <div className="sidebar-categories">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  className={`sidebar-category-btn ${
                    stockType === category.id
                      ? 'sidebar-category-btn-active'
                      : 'sidebar-category-btn-inactive'
                  }`}
                  onClick={() => {
                    setStockType(category.id);
                    onFetchStocks();
                  }}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className={`sidebar-category-label ${category.color}`}>{category.label}</span>
                </motion.button>
              ))}
            </div>
            
            <div className="sidebar-legend">
              <h4 className="sidebar-legend-title">Legend</h4>
              <div className="sidebar-legend-items">
                <div className="sidebar-legend-item">
                  <div className="sidebar-legend-color positive"></div>
                  <span>Positive Change</span>
                </div>
                <div className="sidebar-legend-item">
                  <div className="sidebar-legend-color negative"></div>
                  <span>Negative Change</span>
                </div>
                <div className="sidebar-legend-item">
                  <div className="sidebar-legend-color symbol"></div>
                  <span>Symbol</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        className="glass sidebar-toggle"
        onClick={toggleSidebar}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? (
          <ChevronRightIcon className="sidebar-toggle-icon" />
        ) : (
          <ChevronLeftIcon className="sidebar-toggle-icon" />
        )}
      </motion.button>
    </div>
  );
};

export default Sidebar;
