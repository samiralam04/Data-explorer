# Product Data Explorer

A full-stack application to explore, scrape, and analyze product data from World of Books.

## 🚀 Features

- **On-Demand Scraping**: Uses Playwright + BullMQ to scrape data asynchronously.
- **Queue System**: Redis-backed queue ensures non-blocking operations.
- **Ethical Scraping**: Respects `robots.txt`, implements delays, and uses caching (TTL).
- **Browsing History**: Tracks user navigation and saves to PostgreSQL.
- **Rich Frontend**: Next.js 14, React Query, and Tailwind CSS.
- **API Documentation**: Full Swagger UI.

## 🛠 Tech Stack

- **Backend**: NestJS, Prisma, PostgreSQL, BullMQ, Redis, Playwright.
- **Frontend**: Next.js 14 (App Router), React Query, Tailwind CSS.
- **DevOps**: Docker Compose.

## 🏗 Architecture

```mermaid
graph TD
    Client[Frontend (Next.js)] -->|HTTP| API[Backend (NestJS)]
    API -->|Enqueue| Redis[Redis Queue]
    API -->|Read/Write| DB[(PostgreSQL)]
    Worker[Scrape Worker] -->|Listen| Redis
    Worker -->|Scrape| WOB[World of Books]
    Worker -->|Update| DB
```

## 📦 Database Schema

Key models:
- `Product`: Stores core product info (Price, Title, Image).
- `ProductDetail`: Stores detailed specs, description, ratings.
- `Review`: Stores user reviews.
- `ViewHistory`: Tracks user sessions.
- `ScrapeJob`: Tracks background scraping status.

## 🚦 Setup Instructions

1. **Clone & Install**
   ```bash
   git clone <repo>
   cd product-data-explorer
   ```

2. **Environment Variables**
   Create `.env` in `backend` and `frontend`.
   Example `backend/.env`:
   ```env
   DATABASE_URL="postgresql://admin:admin123@localhost:5433/product_data_explorer?schema=public"
   REDIS_HOST=localhost
   REDIS_PORT=6379
   PORT=4001
   ```

3. **Start Application (Docker)**
   The easiest way to run the full stack (Frontend, Backend, Postgres, Redis):
   ```bash
   docker-compose up --build
   ```
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

4. **Run Tests**
   ```bash
   cd backend
   npm install
   npm run test
   ```

## 🔄 CI/CD

This project uses **GitHub Actions** for continuous integration:
- **Backend Check**: Lints, Builds, and runs Unit Tests on every push.
- **Frontend Check**: Lints and Builds on every push.


6. **Access**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - API Docs: [http://localhost:4001/api/docs](http://localhost:4001/api/docs)

## 🛡 Ethical Scraping

We adhere to strict ethical guidelines:
- **Rate Limiting**: Max 2 concurrent requests.
- **Delays**: 2-second delay between actions.
- **TTL Caching**:
  - Navigation: 7 days
  - Categories: 3 days
  - Products: 24 hours
- **User-Agent**: Custom `ProductDataExplorer/1.0`.

## 🧪 Verification

1. Go to `http://localhost:3000`.
2. Browse categories.
3. Click "Refresh Data" on a product.
4. Check Swagger docs for API details.

---
Part of Assignment.
