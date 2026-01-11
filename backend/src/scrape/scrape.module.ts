import { Module, forwardRef } from '@nestjs/common';
import { ScrapeService } from './scrape.service';
import { ScrapeController } from './scrape.controller';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [forwardRef(() => QueueModule)],
  providers: [ScrapeService],
  controllers: [ScrapeController],
  exports: [ScrapeService]
})
export class ScrapeModule { }
