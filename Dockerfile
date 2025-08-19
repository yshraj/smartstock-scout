FROM ghcr.io/puppeteer/puppeteer:24.7.2

ENV PORT=3000 \
    PRODUCTION=false \
    NODE_ENV=production

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Create data directory and set proper permissions
RUN mkdir -p /usr/src/app/data && \
    chown -R pptruser:pptruser /usr/src/app && \
    chmod -R 755 /usr/src/app

EXPOSE 3000

# Run as pptruser
USER pptruser

CMD ["node", "server.js"]
