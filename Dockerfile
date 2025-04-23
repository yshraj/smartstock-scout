# Use the official Puppeteer image
FROM ghcr.io/puppeteer/puppeteer:latest

# Set working directory
WORKDIR /app

# Copy package files and fix permissions
COPY package*.json ./
USER root
RUN chown -R pptruser:pptruser /app

# Switch to user with permissions (default puppeteer user)
USER pptruser

# Install dependencies
RUN npm install

# Copy rest of the app
COPY --chown=pptruser:pptruser . .

# Expose and run
EXPOSE 3000
CMD ["node", "server.js"]
