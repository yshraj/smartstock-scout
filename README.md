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
- **Frontend**: React, HTML5, CSS3
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
```

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```env
HF_TOKEN=your_hugging_face_api_token
PORT=3000
```

## Usage 🚀

### Development
```bash
# Start the development server
npm run dev
```

### Production
```bash
# Build the React app
npm run build

# Start the production server
npm start
```

### Docker
```bash
# Build the Docker image
docker build -t smartstock-scout .

# Run the container
docker run -p 3000:3000 smartstock-scout
```

## API Endpoints 🌐

- `GET /api/stocks?type=gainers|losers|most-active` - Get stock data
- `GET /api/stock/:symbol` - Get news for a specific stock
- `GET /api/analyze?symbol=SYMBOL` - Get sentiment analysis for a stock

## Project Structure 📁

```
smartstock-scout/
├── ai/                 # AI sentiment analysis
├── build/              # React build output
├── public/             # Static files
├── scraper/            # Web scraping modules
├── src/                # React frontend source
│   ├── components/     # React components
│   └── utils/          # Utility functions
├── .dockerignore
├── .gitignore
├── Dockerfile
├── package.json
├── server.js           # Express backend server
└── README.md
```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
