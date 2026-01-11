import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { ScrapeService } from '../scrape/scrape.service';

@Injectable()
export class ScrapeWorker implements OnModuleInit, OnModuleDestroy {
    private worker: Worker;
    private readonly logger = new Logger(ScrapeWorker.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly scrapeService: ScrapeService,
    ) { }

    onModuleInit() {
        const redisOptions = {
            host: this.configService.get('REDIS_HOST', 'localhost'),
            port: parseInt(this.configService.get('REDIS_PORT', '6379')),
        };

        this.worker = new Worker('scrape', async (job: Job) => {
            this.logger.log(`Processing job ${job.id} (Type: ${job.name})...`);
            try {
                const { jobId } = job.data;
                if (!jobId) throw new Error('Job ID missing in payload');

                await this.scrapeService.processJob(jobId);

                this.logger.log(`Job ${job.id} completed.`);
            } catch (error) {
                this.logger.error(`Job ${job.id} failed: ${error.message}`);
                throw error;
            }
        }, {
            connection: redisOptions,
            concurrency: 2, // Ethical limit
            limiter: {
                max: 10,
                duration: 1000
            }
        });

        this.worker.on('failed', (job, err) => {
            this.logger.error(`BULLMQ Job ${job?.id} failed with ${err.message}`);
        });
    }

    async onModuleDestroy() {
        await this.worker.close();
    }
}
