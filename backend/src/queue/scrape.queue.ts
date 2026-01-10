import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { ScrapeService } from '../scrape/scrape.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ScrapeQueue implements OnModuleInit, OnModuleDestroy {
    private queue: Queue;
    private worker: Worker;
    private readonly logger = new Logger(ScrapeQueue.name);

    constructor(
        private readonly scrapeService: ScrapeService,
        private readonly configService: ConfigService
    ) { }

    onModuleInit() {
        const redisOptions = {
            host: this.configService.get('REDIS_HOST', 'localhost'),
            port: parseInt(this.configService.get('REDIS_PORT', '6379')),
        };

        // Initialize Queue (Producer)
        this.queue = new Queue('scrape', { connection: redisOptions });

        // Initialize Worker (Consumer)
        this.worker = new Worker('scrape', async (job: Job) => {
            this.logger.log(`Processing job ${job.id} (Type: ${job.name})...`);
            try {
                // job.data contains { jobId: string } which refers to our Postgres ScrapeJob ID
                // or we could pass the whole job payload. 
                // Using ID is safer for DB consistency.
                const { jobId } = job.data;
                if (!jobId) throw new Error('Job ID missing in payload');

                await this.scrapeService.processJob(jobId);

                this.logger.log(`Job ${job.id} completed.`);
            } catch (error) {
                this.logger.error(`Job ${job.id} failed: ${error.message}`);
                throw error; // Let BullMQ handle retry logic
            }
        }, {
            connection: redisOptions,
            concurrency: 2, // Ethical limit: max 2 concurrent scrapes
            limiter: {
                max: 10,
                duration: 1000 // Rate limit: Max 10 jobs per second (but concurrency limits active ones)
            }
        });

        this.worker.on('failed', (job, err) => {
            this.logger.error(`BULLMQ Job ${job?.id} failed with ${err.message}`);
        });
    }

    async onModuleDestroy() {
        await this.queue.close();
        await this.worker.close();
    }

    async addScrapeJob(jobId: string) {
        // Enqueue job with retry configuration
        await this.queue.add('scrape-job', { jobId }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000
            },
            removeOnComplete: true, // Keep DB clean-ish
            removeOnFail: false // Keep failed for inspection
        });
        this.logger.log(`Enqueued scrape job for DB ID: ${jobId}`);
    }
}
