FROM ghcr.io/puppeteer/puppeteer:24.7.2

ENV PORT=3000 \
    PRODUCTION=false \
    NODE_ENV=production

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN groupadd -r pptruser && useradd -r -g pptruser pptruser
RUN mkdir -p /usr/src/app/data && chown -R pptruser:pptruser /usr/src/app/data && chmod 755 /usr/src/app/data

EXPOSE 3000

CMD ["node", "server.js"]
