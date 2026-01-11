# Product Data Explorer

A full-stack application to explore, scrape, and analyze product data from World of Books. Built as a submission for the Full-Stack Assignment.

## 🚀 Features

- **On-Demand Scraping**: Uses Playwright + BullMQ to scrape data asynchronously.
- **Queue System**: Redis-backed queue ensures non-blocking operations with automatic retries and exponential backoff.
- **Ethical Scraping**: Respects `robots.txt`, implements 2-second delays, restricts concurrency, and uses TTL caching.
- **Browsing History**: Tracks user navigation and saves to PostgreSQL.
- **Rich Frontend**: Next.js 14 (App Router), React Query, Tailwind CSS, and Pagination.
- **API Documentation**: Full Swagger UI.

## 🛠 Tech Stack

- **Backend**: NestJS, Prisma, PostgreSQL, BullMQ, Redis, Playwright, Winston Logger.
- **Frontend**: Next.js 14 (App Router), React Query, Tailwind CSS, Jest.
- **DevOps**: Docker Compose, GitHub Actions.

## 🏗 Architecture

```mermaid
graph TD
    Client[Frontend (Next.js)] -->|HTTP| API[Backend (NestJS)]
    API -->|Enqueue Job| Redis[Redis Queue]
    API -->|Read/Write| DB[(PostgreSQL)]
    
    subgraph Microservices
    Worker[Scrape Worker] -->|Listen| Redis
    Worker -->|Scrape| WOB[World of Books]
    Worker -->|Update| DB
    end
```

## 📦 Database Schema

Key models:
- `Navigation`: Stores top-level menu items (Books, Fiction, etc.).
- `Category`: Stores categories and their parent/child relationships.
- `Product`: Stores core product info (Price, Title, Image).
- `ProductDetail`: Stores detailed specs, description, ratings.
- `Review`: Stores user reviews.
- `ScrapeJob`: Tracks background scraping status (PENDING, RUNNING, DONE, FAILED).

## 🚦 Setup Instructions

### Option 1: Docker (Recommended)
The easiest way to run the full stack (Frontend, Backend, Postgres, Redis):
```bash
docker-compose up --build
```
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

### Option 2: Local Development
**Prerequisites**: Node.js 18+, Docker (for DB/Redis only).

1. **Start Services**
   ```bash
   docker-compose up -d postgres redis
   ```

2. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npx prisma migrate dev
   npx prisma db seed  # Seeds initial data
   npm run start:dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   cp .env.example .env.local
   npm install
   npm run dev
   ```

### Option 3: Quick Start Script
Mac/Linux users can use the helper script:
```bash
./start.sh
```

## 🧪 Verification & Tests

### Running Tests
```bash
# Backend Unit & E2E Tests
cd backend
npm run test
npm run test:e2e

# Frontend Component Tests
cd frontend
npm run test
```

### Manual Verification
1. Open [http://localhost:3000](http://localhost:3000).
2. **Navigation**: Verify top headings (Books, etc.) are loaded.
3. **Pagination**: Go to a category, scroll down, use "Next/Previous".
4. **Scraping**: Click "Scrape This Category" if empty. Watch the status update.
5. **Ethics**: Observe the console logs in backend to see the 2s delay and cache hits (Skipped: TTL fresh).

## 🛡 Ethical Scraping Policy

We adhere to strict ethical guidelines:
- **Rate Limiting**: Max 2 concurrent requests.
- **Delays**: 2-second delay between actions.
- **TTL Caching**:
  - Navigation: 7 days
  - Categories: 3 days
  - Products: 24 hours
- **User-Agent**: Custom `ProductDataExplorer/1.0`.

## 🔄 CI/CD & Deployment

This project uses **GitHub Actions** for continuous integration:
- **Backend**: Lints, Builds, and runs Unit Tests.
- **Frontend**: Lints, Builds, and runs Component Tests.

**Deployment Checklist**:
- **Frontend**: Deploy to Vercel/Netlify. Set `NEXT_PUBLIC_API_URL`.
- **Backend**: Deploy to Render/Railway/Fly.io. Set `DATABASE_URL` and `REDIS_URL`.
