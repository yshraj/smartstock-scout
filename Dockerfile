# Use an official Node.js image with Chromium
FROM ghcr.io/puppeteer/puppeteer:latest

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose port (same as in your server.js)
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
