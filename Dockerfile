FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY server.mjs ./server.mjs
COPY index.html index-5.html manifest.webmanifest icon.svg sw.js sync-panel.js ./public/
COPY data/ ./public/data/

EXPOSE 8080
CMD ["node", "server.mjs"]
