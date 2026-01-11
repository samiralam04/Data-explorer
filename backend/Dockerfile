FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
# Install all dependencies (including dev for build)
RUN npm ci

COPY . .

RUN npm run build
RUN npm prune --production

# Runner Stage
FROM node:20-slim

WORKDIR /app

# Install Playwright dependencies
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    librandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright browsers (chromium only to save space if possible, or all)
RUN npx playwright install --with-deps chromium

USER node

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
