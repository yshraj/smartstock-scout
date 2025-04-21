const { HfInference } = require('@huggingface/inference');
const hf = new HfInference(process.env.HF_TOKEN);

async function analyzeSentiment(text) {
  try {
    const result = await hf.textClassification({
      model: 'distilbert-base-uncased-finetuned-sst-2-english',
      inputs: text
    });
    return {
      label: result[0].label,
      score: result[0].score
    };
  } catch (error) {
    console.error('AI analysis failed:', error);
    return { label: 'ERROR', score: 0 };
  }
}

module.exports = { analyzeSentiment };