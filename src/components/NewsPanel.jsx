import React from 'react';
import { motion } from 'framer-motion';
import { ChartPieIcon } from '@heroicons/react/24/solid';
import SentimentChart from './SentimentChart';

const NewsPanel = ({ symbol, newsData, loading }) => {
  const renderLoadingState = () => (
    <div className="news-container">
      {Array.from({ length: 3 }).map((_, index) => (
        <motion.div 
          key={index}
          className="glass news-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="loading-bar loading-bar-title"></div>
          <div className="loading-bar loading-bar-text"></div>
          <div className="loading-bar loading-bar-text-alt"></div>
          <div className="loading-bar-footer">
            <div className="loading-bar loading-bar-date"></div>
            <div className="loading-bar loading-bar-button-alt"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const getSentimentColor = (label) => {
    if (label === 'POSITIVE') return 'sentiment-positive';
    if (label === 'NEGATIVE') return 'sentiment-negative';
    return 'sentiment-neutral';
  };

  return (
    <motion.div 
      className="news-panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="news-header">
        <ChartPieIcon className="news-header-icon" />
        <h2 className="news-header-title">
          News Analysis for <span className="news-header-symbol">{symbol}</span>
        </h2>
      </div>

      {loading ? (
        renderLoadingState()
      ) : newsData && newsData.length > 0 ? (
        <div className="news-container">
          {newsData.map((item, index) => (
            <motion.div
              key={index}
              className="glass news-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              <h3 className="news-card-title">{item.title}</h3>

              {item.sentiment && (
                <div className="sentiment-container">
                  <span className={`sentiment-badge ${getSentimentColor(item.sentiment.label)}`}>
                    {item.sentiment.label} ({Math.round(item.sentiment.score * 100)}%)
                  </span>
                  <SentimentChart sentiment={item.sentiment} />
                </div>
              )}

              <p className="news-card-summary">{item.summary}</p>

              <div className="news-card-footer">
                <small className="news-card-date">{item.published}</small>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="news-card-link"
                  >
                    Read Full Article
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass news-empty">
          <p className="news-empty-text">No news data available for this stock</p>
        </div>
      )}
    </motion.div>
  );
};

export default NewsPanel;
