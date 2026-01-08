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

        // Trigger processing asynchronously
        this.processJob(job.id).catch(err => this.logger.error(err));

        return job;
    }

    /**
     * Main processor for scrape jobs.
     * Can be triggered via Cron or API.
     * For simplicity, let's just run it on demand or loop one by one.
     */
    async processJob(jobId: string) {
        const job = await this.prisma.scrapeJob.findUnique({ where: { id: jobId } });
        if (!job) return;

        await this.prisma.scrapeJob.update({
            where: { id: jobId },
            data: { status: 'RUNNING', started_at: new Date() },
        });

        try {
            this.logger.log(`Starting scrape job ${jobId} for ${job.target_url}`);

            this.crawler = new PlaywrightCrawler({
                // headless: true, // Default
                requestHandler: async ({ page, request, log }) => {
                    log.info(`Processing ${request.url} ...`);

                    if (job.target_type === 'NAVIGATION') {
                        await this.handleNavigation(page);
                    } else if (job.target_type === 'CATEGORY') {
                        await this.handleCategory(page, job.target_url);
                    } else if (job.target_type === 'PRODUCT') {
                        await this.handleProduct(page, job.target_url);
                    }
                },
                maxRequestsPerCrawl: 50, // Safety limit
            });

            await this.crawler.run([job.target_url]);

            await this.prisma.scrapeJob.update({
                where: { id: jobId },
                data: { status: 'DONE', finished_at: new Date() },
            });
            this.logger.log(`Job ${jobId} completed.`);
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

            // Also upsert a corresponding root Category for this navigation item
            // This allows it to be browsed as a category (product list)
            // Use the link as source_url (handling relative paths if needed later, but scraping usually gives relative or absolute)
            // Playwright's href is usually absolute if we access .href property, but let's assume relative from text content extraction might need care.
            // In handleNavigation we used `el => el.getAttribute('href')` so it returns relative path usually.
            // We'll store it as is, frontend will prepend domain if needed, or we can prepend here.
            // The browser subagent saw `https://www.worldofbooks.com/en-gb/collections/fiction-books`

            // Let's ensure we save the link as source_url
            // If it starts with /, we can prepend domain during scrape or use as is. 
            // Let's store as is for now, consistent with how we got it.
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
        // Resolve navigation ID if possible, or parent category.
        // For simplicity, we just link to existing category if slug matches, or create loose one.
        // Ideally we'd look up the navigation item first.

        // Find or create category
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
            const specs = {}; // Extract parsing logic here if needed

            // Extract ISBN if possible
            // This logic depends on exact structure 

            return {
                title,
                author,
                price: priceText?.replace(/[^\d.]/g, ''),
                description,
                specs
            };
        });

        const product = await this.prisma.product.findUnique({ where: { source_url: url } });
        if (!product) return; // Should exist if job created correctly or upsert here

        await this.prisma.productDetail.upsert({
            where: { product_id: product.id },
            update: {
                description: data.description,
                specs: data.specs,
            },
            create: {
                product_id: product.id,
                description: data.description,
                specs: data.specs,
                reviews_count: 0,
                ratings_avg: 0
            }
        });
    }
}
