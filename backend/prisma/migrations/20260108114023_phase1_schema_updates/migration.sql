-- CreateIndex
CREATE INDEX "product_source_id_idx" ON "product"("source_id");

-- CreateIndex
CREATE INDEX "product_source_url_idx" ON "product"("source_url");

-- CreateIndex
CREATE INDEX "product_last_scraped_at_idx" ON "product"("last_scraped_at");
