import axios from 'axios';

const hostname = window?.location?.hostname || '';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || ((hostname === 'localhost' || hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : 'https://smartstock-scout.netlify.app');

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

export const fetchStocks = async (type, refresh = false) => {
  try {
    const url = refresh
      ? `${API_BASE_URL}/api/stocks?type=${type}&refresh=true`
      : `${API_BASE_URL}/api/stocks?type=${type}`;
    const response = await axios.get(url);
    // Extract the data array from the response (server now returns { data: [...], cache: {...} })
    return response.data.data || response.data;
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
