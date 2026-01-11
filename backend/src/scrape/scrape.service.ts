import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlaywrightCrawler, Dataset, KeyValueStore, RequestQueue } from 'crawlee';
import { ScrapeJob } from '@prisma/client';

@Injectable()
export class ScrapeService implements OnModuleInit {
    private readonly logger = new Logger(ScrapeService.name);
    private crawler: PlaywrightCrawler;

    constructor(private readonly prisma: PrismaService) { }

    async onModuleInit() {
        // Initialize crawler config
        // Resume pending jobs
        const pendingJobs = await this.prisma.scrapeJob.findMany({
            where: { status: { in: ['PENDING', 'RUNNING'] } }
        });

        this.logger.log(`Found ${pendingJobs.length} pending/running jobs. Resuming...`);
        for (const job of pendingJobs) {
            // Reset running to pending to be safe, or just process
            this.processJob(job.id).catch(err => this.logger.error(err));
        }
    }

    /**
     * Adds a scrape job to the database queue.
     */
    async addJob(targetUrl: String, targetType: 'NAVIGATION' | 'CATEGORY' | 'PRODUCT') {
        // Check if pending job exists
        const existing = await this.prisma.scrapeJob.findFirst({
            where: {
                target_url: targetUrl.toString(),
                status: { in: ['PENDING', 'RUNNING'] },
            },
        });

        if (existing) {
            this.logger.log(`Job already exists for ${targetUrl}`);
            return existing;
        }

        const job = await this.prisma.scrapeJob.create({
            data: {
                target_url: targetUrl.toString(),
                target_type: targetType,
                status: 'PENDING',
            },
        });



        return job;
    }

    async getJobStatus(id: string) {
        return this.prisma.scrapeJob.findUnique({ where: { id } });
    }


    async processJob(jobId: string) {
        const job = await this.prisma.scrapeJob.findUnique({ where: { id: jobId } });
        if (!job) return;

        // ETHICAL CHECK: Verify TTL
        if (await this.isFresh(job.target_url, job.target_type)) {
            this.logger.log(`Skipping scrape for ${job.target_url} (Data is fresh)`);
            await this.prisma.scrapeJob.update({
                where: { id: jobId },
                data: { status: 'SKIPPED', finished_at: new Date(), error_log: 'Skipped: TTL fresh' }
            });
            return;
        }

        await this.prisma.scrapeJob.update({
            where: { id: jobId },
            data: { status: 'RUNNING', started_at: new Date() },
        });

        this.crawler = new PlaywrightCrawler({
            launchContext: {
                userAgent: 'ProductDataExplorer/1.0 (+http://localhost:3000)',
            },
            requestHandler: async ({ page, request, log }) => {
                log.info(`Processing ${request.url} ...`);

                // ETHICAL DELAY
                await new Promise(r => setTimeout(r, 2000));

                if (job.target_type === 'NAVIGATION') {
                    await this.handleNavigation(page);
                } else if (job.target_type === 'CATEGORY') {
                    await this.handleCategory(page, job.target_url);
                } else if (job.target_type === 'PRODUCT') {
                    await this.handleProduct(page, job.target_url);
                }
            },
            maxConcurrency: 2, // Ethical limit
            requestHandlerTimeoutSecs: 60,
        });

        try {
            await this.crawler.run([job.target_url]);
            await this.prisma.scrapeJob.update({
                where: { id: jobId },
                data: { status: 'DONE', finished_at: new Date() },
            });
            // Update last_scraped_at on the entity itself
            await this.updateEntityTimestamp(job.target_url, job.target_type);
        } catch (e) {
            this.logger.error(`Job ${jobId} failed: ${e.message}`);
            await this.prisma.scrapeJob.update({
                where: { id: jobId },
                data: { status: 'FAILED', error_log: e.message, finished_at: new Date() },
            });
        }
    }

    private async handleNavigation(page: any) {
        this.logger.log('Scraping Navigation...');
        // Selector based on inspection
        // Confirmed: .header__menu-item
        const navItems = await page.$$eval('.header__menu-item', (items: any[]) => {
            return items.map(item => {
                const link = item.getAttribute('href');
                const title = item.innerText.trim();
                return { title, link };
            });
        });

        this.logger.log(`Raw found nav items: ${navItems.length}`);
        const filteredItems = navItems.filter(i => i.link && i.title);
        this.logger.log(`Filtered nav items: ${filteredItems.length}`);

        for (const item of filteredItems) {
            if (!item.link.startsWith('/')) continue; // Skip external or weird links
            const slug = item.link.split('/').pop();
            const title = item.title;

            // Upsert Navigation
            const nav = await this.prisma.navigation.upsert({
                where: { slug },
                update: { last_scraped_at: new Date() },
                create: { title, slug, last_scraped_at: new Date() },
            });


            const source_url = item.link;

            await this.prisma.category.upsert({
                where: { slug },
                update: {
                    navigation_id: nav.id,
                    title,
                    source_url
                },
                create: {
                    title,
                    slug,
                    navigation_id: nav.id,
                    source_url
                }
            });
        }
        this.logger.log(`Upserted ${filteredItems.length} navigation items (and corresponding categories).`);
    }

    private async handleCategory(page: any, url: string) {
        this.logger.log(`Scraping Category: ${url}`);

        // Check if dynamic content needs waiting
        // The selector .ais-InfiniteHits-item suggests Algolia.
        try {
            await page.waitForSelector('.product-item, .ais-InfiniteHits-item, .product-card', { timeout: 10000 });
        } catch {
            this.logger.warn(`No products found on ${url}`);
            return;
        }

        const categorySlug = url.split('/').pop();

        let category = await this.prisma.category.findUnique({ where: { slug: categorySlug } });
        if (!category) {
            // Try to link to a default nav if unknown
            const nav = await this.prisma.navigation.findFirst();
            if (!nav) {
                this.logger.warn('No default navigation found to attach category to.');
                return;
            }
            category = await this.prisma.category.create({
                data: {
                    title: categorySlug || 'Unknown',
                    slug: categorySlug || 'unknown',
                    navigation_id: nav.id
                }
            });
        }

        const products = await page.$$eval('.product-item, .ais-InfiniteHits-item, .product-card, .product-card-wrapper, .main-product-card', (items: any[]) => {
            return items.map(item => {
                const titleEl = item.querySelector('.product-title, .product-card__title, h3, .truncate-title');
                const authorEl = item.querySelector('.product-author, .author');
                const priceEl = item.querySelector('.price, .product-price');
                const imgEl = item.querySelector('img');
                const linkEl = item.querySelector('a') || item; // sometimes the card itself is the link

                return {
                    title: titleEl?.innerText?.trim() || 'Unknown Title',
                    author: authorEl?.innerText?.trim(),
                    price: priceEl?.innerText?.trim()?.replace(/[^\d.]/g, '') || '0',
                    image_url: imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src'),
                    source_url: linkEl?.getAttribute('href') || linkEl?.parentElement?.getAttribute('href')
                };
            });
        });

        this.logger.log(`Found ${products.length} products in ${categorySlug}`);

        // Deduplicate products by source_url, prioritizing those with valid titles
        const uniqueProducts = new Map<string, any>();
        for (const p of products) {
            if (!p.source_url) continue;
            const fullUrl = p.source_url.startsWith('http') ? p.source_url : `https://www.worldofbooks.com${p.source_url}`; // consistent key

            const existing = uniqueProducts.get(fullUrl);
            if (!existing) {
                uniqueProducts.set(fullUrl, p);
            } else {
                // strict preference for known title
                if (existing.title === 'Unknown Title' && p.title !== 'Unknown Title') {
                    uniqueProducts.set(fullUrl, p);
                }
            }
        }

        const deduplicatedProducts = Array.from(uniqueProducts.values());
        this.logger.log(`Deduplicated to ${deduplicatedProducts.length} unique products.`);

        for (const p of deduplicatedProducts) {
            if (!p.source_url) {
                this.logger.warn(`Skipping product with missing source_url: ${p.title}`);
                continue;
            }
            const fullUrl = p.source_url.startsWith('http') ? p.source_url : `https://www.worldofbooks.com${p.source_url}`;
            const sourceId = fullUrl.split('/').pop() || p.title; // Fallback source ID

            this.logger.log(`Upserting product: ${p.title} | URL: ${fullUrl}`);

            await this.prisma.product.upsert({
                where: { source_url: fullUrl },
                update: {
                    title: p.title, // Update title if it changed (or was Unknown)
                    author: p.author,
                    price: parseFloat(p.price) || 0,
                    image_url: p.image_url,
                    last_scraped_at: new Date(),
                },
                create: {
                    source_id: sourceId,
                    title: p.title,
                    author: p.author,
                    price: parseFloat(p.price) || 0,
                    image_url: p.image_url,
                    source_url: fullUrl,
                    slug: sourceId,
                    category_id: category.id,
                    last_scraped_at: new Date(),
                }
            });
        }
    }

    private async handleProduct(page: any, url: string) {
        this.logger.log(`Scraping Product: ${url}`);

        // Wait for title
        await page.waitForSelector('h1', { timeout: 10000 });

        const data = await page.evaluate(() => {
            const title = (document.querySelector('h1') as HTMLElement)?.innerText?.trim();
            const author = (document.querySelector('.product-author, .author') as HTMLElement)?.innerText?.trim();
            const priceText = (document.querySelector('.price') as HTMLElement)?.innerText?.trim();
            const description = document.querySelector('.description, .product-description')?.innerHTML;
            const specs = {};

            // Extract Reviews
            const reviewElements = document.querySelectorAll('.review-item, .feefo-review');
            const reviews = Array.from(reviewElements).map(el => ({
                author: (el.querySelector('.review-author, .feefo-review-author') as HTMLElement)?.innerText?.trim() || 'Anonymous',
                rating: parseFloat((el.querySelector('.rating, .star-rating') as HTMLElement)?.getAttribute('data-rating') || '0') || 5, // Default to 5 if structure unclear
                text: (el.querySelector('.review-text, .feefo-review-description') as HTMLElement)?.innerText?.trim() || ''
            }));

            // Calculate aggregated
            const ratingsAvg = reviews.length > 0 ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length : 0;

            return {
                title,
                author,
                price: priceText?.replace(/[^\d.]/g, ''),
                description,
                specs,
                reviews,
                ratingsAvg,
                reviewsCount: reviews.length
            };
        });

        const product = await this.prisma.product.findUnique({ where: { source_url: url } });
        if (!product) return;

        await this.prisma.productDetail.upsert({
            where: { product_id: product.id },
            update: {
                description: data.description,
                specs: data.specs,
                ratings_avg: data.ratingsAvg,
                reviews_count: data.reviewsCount
            },
            create: {
                product_id: product.id,
                description: data.description,
                specs: data.specs,
                reviews_count: data.reviewsCount,
                ratings_avg: data.ratingsAvg
            }
        });

        // Save Reviews
        if (data.reviews.length > 0) {
            // Clear old reviews to avoid duplicates/stale data
            await this.prisma.review.deleteMany({ where: { product_id: product.id } });

            await this.prisma.review.createMany({
                data: data.reviews.map(r => ({
                    product_id: product.id,
                    author: r.author,
                    rating: r.rating,
                    text: r.text
                }))
            });
            this.logger.log(`Saved ${data.reviews.length} reviews for ${product.title}`);
        }
    }

    private async isFresh(url: string, type: string): Promise<boolean> {
        let lastScraped: Date | null | undefined;

        if (type === 'NAVIGATION') {
            const nav = await this.prisma.navigation.findFirst();
            lastScraped = nav?.last_scraped_at;
            // TTL: 7 days
            if (lastScraped && (Date.now() - lastScraped.getTime() < 7 * 24 * 60 * 60 * 1000)) return true;
        } else if (type === 'CATEGORY') {
            const cat = await this.prisma.category.findFirst({ where: { source_url: { contains: url } } });
            lastScraped = cat?.last_scraped_at;
            // TTL: 3 days
            if (lastScraped && (Date.now() - lastScraped.getTime() < 3 * 24 * 60 * 60 * 1000)) return true;
        } else if (type === 'PRODUCT') {
            const prod = await this.prisma.product.findUnique({ where: { source_url: url } });
            lastScraped = prod?.last_scraped_at;
            // TTL: 24 hours
            if (lastScraped && (Date.now() - lastScraped.getTime() < 24 * 60 * 60 * 1000)) return true;
        }
        return false;
    }

    private async updateEntityTimestamp(url: string, type: string) {
        const now = new Date();
        if (type === 'NAVIGATION') {
            await this.prisma.navigation.updateMany({ data: { last_scraped_at: now } });
        } else if (type === 'CATEGORY') {
            await this.prisma.category.updateMany({
                where: { source_url: { contains: url } },
                data: { last_scraped_at: now }
            });
        }
    }
}
