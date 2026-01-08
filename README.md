# Product Data Explorer

A full-stack web application designed to scrape, store, and explore product data from *World of Books*, featuring a robust scraping engine, a persistent database, and a responsive frontend interface.

## 🚀 Project Overview

The **Product Data Explorer** allows users to:
1.  **Scrape Navigation**: Automatically discover all book categories from the source website.
2.  **Scrape Categories**: Intelligently crawl categories to find products, handling different page layouts (`/collections/` vs `/pages/`).
3.  **Explore Data**: Browse scraped categories and products via a modern web interface.
4.  **Deduplicate Data**: Ensures data integrity by filtering out "ghost" products (placeholder entries) in favor of valid data.

### 🏗️ Tech Stack

*   **Backend**: NestJS (TypeScript), Prisma ORM, Crawlee + Playwright (Headless Browser Scraping).
*   **Database**: PostgreSQL (Persistence), Redis (Queue/Caching - *Prepared*).
*   **Frontend**: Next.js 14 (App Router), React Query, Tailwind CSS.
*   **Infrastructure**: Docker & Docker Compose.

---

## 🛠️ Prerequisites

*   **Node.js** (v18 or higher)
*   **Docker Desktop** (for PostgreSQL)
*   **npm** or **yarn**

---

## ⚙️ Setup & Installation

### 1. Clone the Repository
```bash
git clone <repository_url>
cd product-data-explorer
```

### 2. Start Infrastructure (PostgreSQL)
Ensure Docker is running, then start the database container:
```bash
docker-compose up -d
```
*This starts PostgreSQL on port `5433` to avoid conflicts with default local instances.*

### 3. Backend Setup
```bash
cd backend
npm install

# Run Migrations to setup Database Schema
npx prisma migrate dev

# Start the Backend Server (Runs on Port 4001)
npm run start
```

### 4. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install

# Start the Frontend Development Server (Runs on Port 3000/3001)
npm run dev
```

Visit `http://localhost:3001` (or the port shown in your terminal) to access the application.

---

## 📖 Usage Guide

### Scrape Navigation
1.  On the homepage, you will see a sidebar or a "Scrape Navigation" button.
2.  Click **"Scrape Navigation"**.
3.  This will crawl the main menu of *World of Books* and populate the database with categories (e.g., "Fiction Books", "Rare Books").
4.  *Note: This process takes about 30-60 seconds.*

### Scrape Products
1.  Click on any category from the list (e.g., **"Fiction Books"**).
2.  If the category is empty, click the **"Try Scraping"** button (or "Scrape This Category").
3.  The backend will spawn a Playwright browser to:
    *   Navigate to the correct source URL (handling both `/collections/` and `/pages/` layouts).
    *   Extract product titles, authors, prices, and images.
    *   **Deduplicate** entries to ensure "Unknown Title" placeholders don't overwrite good data.
4.  Refresh the page after ~30 seconds to see the products appear.

---

## 🐛 Troubleshooting & Fixes

### "Unknown Title" Issue
*   **Problem:** Products were appearing with "Unknown Title" and £0.00 price.
*   **Cause:**
    1.  The website uses two different layouts: `/collections/` (Grid) and `/pages/` (Landing). The landing page layout used a different container class (`.product-card-wrapper`).
    2.  The scraper selector was failing to find the title inside the container.
*   **Fix Implemented:** Updated `ScrapeService` to support multiple container selectors (`.product-card-wrapper`, `.main-product-card`) and corrected the title extraction logic. Added deduplication to prioritize valid titles.

### 404 Errors During Scraping
*   **Problem:** Scraping failed with 404 errors for certain categories.
*   **Cause:** The application was "guessing" URLs (e.g., `/category/slug`), but the site often uses `/collections/slug` or `/pages/slug`.
*   **Fix Implemented:** Added `source_url` to the database. The scraper now saves exactly where it found the link, and the frontend uses this exact URL to trigger jobs.

---

## 📡 API Reference

The backend runs on `http://localhost:4001`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/scrape/navigation` | Triggers a full navigation scrape. |
| `POST` | `/scrape/category` | Triggers scraping for a specific category URL. Body: `{ "url": "..." }` |
| `GET` | `/navigation` | Returns all navigation items. |
| `GET` | `/categories/:slug/products` | Returns products for a specific category. |

---

## 📂 Project Structure

```
product-data-explorer/
├── backend/            # NestJS Application
│   ├── src/
│   │   ├── scrape/     # Scraping Logic (Crawlee + Playwright)
│   │   ├── category/   # Category Management
│   │   └── product/    # Product Management
│   └── prisma/         # Database Schema
│
├── frontend/           # Next.js Application
│   ├── app/            # App Router Pages
│   └── components/     # UI Components
│
└── docker-compose.yml  # Database Configuration
```
