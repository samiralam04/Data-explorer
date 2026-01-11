import { Controller, Post, Body } from '@nestjs/common';
import { HistoryService } from './history.service';
import { ViewHistoryDto } from './dto/view-history.dto';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('History')
@Controller('history')
export class HistoryController {
    constructor(private readonly historyService: HistoryService) { }

    @Post()
    @ApiOperation({ summary: 'Save browsing history' })
    @ApiBody({ type: ViewHistoryDto })
    async saveHistory(@Body() body: ViewHistoryDto) {
        return this.historyService.saveHistory(body);
    }
}
