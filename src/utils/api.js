import axios from 'axios';

const hostname = window?.location?.hostname || '';
const API_BASE_URL = (hostname === 'localhost' || hostname === '127.0.0.1')
  ? 'http://localhost:3000'
  : 'https://smartstock-scout.onrender.com';

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
  "Assessing technical indicators...",
  "Reviewing P/E fluctuations...",
  "Getting smarter... 🧠"
];

export const fetchStocks = async (type, forceRefresh = false) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/stocks?type=${type}${forceRefresh ? '&force=true' : ''}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const fetchStockAnalysis = async (symbol) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/analyze?symbol=${symbol}`);
    return response.data;
  } catch (error) {
    console.error('Analysis Error:', error);
    throw error;
  }
};

export const getRandomLoadingPhrase = () => {
  return loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)];
};
