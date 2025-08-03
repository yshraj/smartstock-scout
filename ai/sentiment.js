const { HfInference } = require('@huggingface/inference');

// Validate HF_TOKEN at startup
if (!process.env.HF_TOKEN) {
  console.warn('⚠️  WARNING: HF_TOKEN not found in environment variables. Sentiment analysis will return default values.');
}

const hf = process.env.HF_TOKEN ? new HfInference(process.env.HF_TOKEN) : null;

// Simple in-memory cache for sentiment analysis results
const sentimentCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

function getCachedResult(text) {
  const cached = sentimentCache.get(text);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }
  return null;
}

function setCachedResult(text, result) {
  sentimentCache.set(text, {
    result,
    timestamp: Date.now()
  });
}

async function analyzeSentiment(text) {
  // Return cached result if available
  const cachedResult = getCachedResult(text);
  if (cachedResult) {
    console.log(`📦 Using cached sentiment for: ${text.substring(0, 50)}...`);
    return cachedResult;
  }

  // If no HF token, return neutral sentiment
  if (!hf) {
    const neutralResult = { label: 'NEUTRAL', score: 0.5 };
    setCachedResult(text, neutralResult);
    return neutralResult;
  }

  try {
    console.log(`🧠 Analyzing sentiment for: ${text.substring(0, 50)}...`);
    const result = await hf.textClassification({
      model: 'distilbert-base-uncased-finetuned-sst-2-english',
      inputs: text
    });
    
    const sentimentResult = {
      label: result[0].label,
      score: result[0].score
    };
    
    // Cache the result
    setCachedResult(text, sentimentResult);
    
    return sentimentResult;
  } catch (error) {
    console.error('❌ AI analysis failed:', error.message || error);
    
    // Return a default neutral sentiment on failure
    const defaultResult = { label: 'NEUTRAL', score: 0.5 };
    setCachedResult(text, defaultResult);
    return defaultResult;
  }
}

module.exports = { analyzeSentiment };
