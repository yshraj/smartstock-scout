# SmartStock Scout 📈

An AI-powered stock market analyzer that scrapes Yahoo Finance data and performs sentiment analysis using Hugging Face models.

![Dashboard Screenshot](./public/screenshot.png)

## Features ✨

- Real-time stock data scraping from Yahoo Finance
- AI-powered sentiment analysis of financial news
- Top gainers/losers/most-active tracking
- Clean, responsive dashboard interface
- CSV export functionality
- Docker support for easy deployment

## Tech Stack 🛠️

- **Backend**: Node.js, Express, Puppeteer
- **Frontend**: Vanilla JS, HTML5, CSS3
- **AI**: Hugging Face Inference API
- **Deployment**: Docker, Vercel/Heroku

## Installation ⚙️

### Prerequisites
- Node.js v16+
- Hugging Face API token

### Setup
```bash
# Clone repository
git clone https://github.com/yshraj/smartstock-scout
cd smartstock-scout

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials