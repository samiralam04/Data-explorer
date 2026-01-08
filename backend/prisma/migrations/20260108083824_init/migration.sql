-- CreateTable
CREATE TABLE "navigation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "last_scraped_at" TIMESTAMP(3),

    CONSTRAINT "navigation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" TEXT NOT NULL,
    "navigation_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "product_count" INTEGER NOT NULL DEFAULT 0,
    "last_scraped_at" TIMESTAMP(3),

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "image_url" TEXT,
    "source_url" TEXT NOT NULL,
    "last_scraped_at" TIMESTAMP(3),
    "category_id" TEXT,
    "slug" TEXT NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_detail" (
    "product_id" TEXT NOT NULL,
    "description" TEXT,
    "specs" JSONB,
    "ratings_avg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviews_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_detail_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scrape_job" (
    "id" TEXT NOT NULL,
    "target_url" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "error_log" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scrape_job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "view_history" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "path_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "view_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "navigation_slug_key" ON "navigation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "category_slug_key" ON "category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_source_id_key" ON "product"("source_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_source_url_key" ON "product"("source_url");

-- CreateIndex
CREATE UNIQUE INDEX "product_slug_key" ON "product"("slug");

-- CreateIndex
CREATE INDEX "product_slug_idx" ON "product"("slug");

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_navigation_id_fkey" FOREIGN KEY ("navigation_id") REFERENCES "navigation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_detail" ADD CONSTRAINT "product_detail_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
