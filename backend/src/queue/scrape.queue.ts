import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ScrapeQueue implements OnModuleInit, OnModuleDestroy {
    private queue: Queue;
    private readonly logger = new Logger(ScrapeQueue.name);

    constructor(
        private readonly configService: ConfigService
    ) { }

    onModuleInit() {
        const redisOptions = {
            host: this.configService.get('REDIS_HOST', 'localhost'),
            port: parseInt(this.configService.get('REDIS_PORT', '6379')),
        };

        this.queue = new Queue('scrape', { connection: redisOptions });
    }

    async onModuleDestroy() {
        await this.queue.close();
    }

    async addScrapeJob(jobId: string, type: string) {
        await this.queue.add('scrape-job', { jobId, type }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000
            },
            removeOnComplete: true,
            removeOnFail: false
        });
        this.logger.log(`Enqueued scrape job for DB ID: ${jobId}`);
    }
}
