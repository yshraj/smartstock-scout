FROM ghcr.io/puppeteer/puppeteer:24.7.2

ENV PORT=3000 \
    PRODUCTION=false \
    NODE_ENV=production

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Switch to root to set permissions
USER root

RUN npm run build && \
    mkdir -p /usr/src/app/data && \
    chown -R pptruser:pptruser /usr/src/app && \
    chmod -R 755 /usr/src/app

EXPOSE 3000

# Switch back to pptruser for running the application
USER pptruser

CMD ["node", "server.js"]
