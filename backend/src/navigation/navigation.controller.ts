import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { NavigationService } from './navigation.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Navigation')
@Controller('navigation')
export class NavigationController {
    constructor(private readonly navigationService: NavigationService) { }

    @Get()
    @ApiOperation({ summary: 'List all top-level values' })
    findAll() {
        return this.navigationService.findAll();
    }

    @Get(':slug')
    @ApiOperation({ summary: 'Get details of a navigation section' })
    async findOne(@Param('slug') slug: string) {
        const nav = await this.navigationService.findOne(slug);
        if (!nav) throw new NotFoundException('Navigation not found');
        return nav;
    }
}
