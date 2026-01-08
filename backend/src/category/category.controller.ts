import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Get(':slug')
    @ApiOperation({ summary: 'Get category info' })
    async findOne(@Param('slug') slug: string) {
        const category = await this.categoryService.findBySlug(slug);
        if (!category) throw new NotFoundException('Category not found');
        return category;
    }

    @Get(':slug/products')
    @ApiOperation({ summary: 'Get products in category' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    async findProducts(
        @Param('slug') slug: string,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
    ) {
        const result = await this.categoryService.findProducts(slug, +page, +limit);
        if (!result) throw new NotFoundException('Category not found');
        return result;
    }
}
