import { Module } from '@nestjs/common';
import { ScrapeService } from './scrape.service';
import { ScrapeController } from './scrape.controller';
import { ScrapeQueue } from '../queue/scrape.queue';

@Module({
  providers: [ScrapeService, ScrapeQueue],
  controllers: [ScrapeController],
  exports: [ScrapeService, ScrapeQueue]
})
export class ScrapeModule { }
