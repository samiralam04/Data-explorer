import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ScrapeService } from './scrape.service';
import { ScrapeQueue } from '../queue/scrape.queue';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ScrapeRequestDto } from './dto/scrape-request.dto';

@ApiTags('Scrape')
@Controller('scrape')
export class ScrapeController {
    constructor(
        private readonly scrapeService: ScrapeService,
        private readonly scrapeQueue: ScrapeQueue
    ) { }

    @Post('navigation')
    @ApiOperation({ summary: 'Trigger navigation scrape' })
    async scrapeNavigation() {
        const job = await this.scrapeService.addJob('https://www.worldofbooks.com', 'NAVIGATION');
        await this.scrapeQueue.addScrapeJob(job.id);
        return job;
    }

    @Post('category')
    @ApiOperation({ summary: 'Trigger category scrape' })
    @ApiBody({ type: ScrapeRequestDto })
    async scrapeCategory(@Body() body: ScrapeRequestDto) {
        const job = await this.scrapeService.addJob(body.url, 'CATEGORY');
        await this.scrapeQueue.addScrapeJob(job.id);
        return job;
    }

    @Post('product')
    @ApiOperation({ summary: 'Trigger product scrape' })
    @ApiBody({ type: ScrapeRequestDto })
    async scrapeProduct(@Body() body: ScrapeRequestDto) {
        const job = await this.scrapeService.addJob(body.url, 'PRODUCT');
        await this.scrapeQueue.addScrapeJob(job.id);
        return job;
    }

    @Get('job/:id')
    @ApiOperation({ summary: 'Get job status' })
    async getJob(@Param('id') id: string) {
        return this.scrapeService.getJobStatus(id);
    }
}
