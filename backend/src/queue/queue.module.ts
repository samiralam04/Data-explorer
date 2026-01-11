import { Module, Global, forwardRef } from '@nestjs/common';
import { ScrapeQueue } from './scrape.queue';
import { ScrapeWorker } from './scrape.worker';
import { ScrapeModule } from '../scrape/scrape.module';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
    imports: [
        ConfigModule,
        forwardRef(() => ScrapeModule),
    ],
    providers: [ScrapeQueue, ScrapeWorker],
    exports: [ScrapeQueue]
})
export class QueueModule { }
