import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ScrapeService } from './scrape.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Scrape')
@Controller('scrape')
export class ScrapeController {
    constructor(private readonly scrapeService: ScrapeService) { }

    @Post('navigation')
    @ApiOperation({ summary: 'Trigger navigation scrape' })
    async scrapeNavigation() {
        return this.scrapeService.addJob('https://www.worldofbooks.com', 'NAVIGATION');
    }

    @Post('category')
    @ApiOperation({ summary: 'Trigger category scrape' })
    async scrapeCategory(@Body('url') url: string) {
        return this.scrapeService.addJob(url, 'CATEGORY');
    }

    @Post('product')
    @ApiOperation({ summary: 'Trigger product scrape' })
    async scrapeProduct(@Body('url') url: string) {
        return this.scrapeService.addJob(url, 'PRODUCT');
    }

    @Get('job/:id')
    @ApiOperation({ summary: 'Get job status' })
    async getJob(@Param('id') id: string) {
        // Ideally use a dedicated service method, but accessing service logic is fine
        // However scrapeService.processJob is void. I need a status getter.
        // For now, I'll return a placeholder or implement getJobStatus in logic.
        return { status: 'implemented-soon', id };
    }
}
