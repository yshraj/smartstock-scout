FROM ghcr.io/puppeteer/puppeteer:24.7.2

ENV PORT=3000 \
    PRODUCTION=false \
    NODE_ENV=production

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN mkdir -p /tmp/data

EXPOSE 3000

CMD ["node", "server.js"]
