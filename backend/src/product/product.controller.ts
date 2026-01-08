import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Get(':id')
    @ApiOperation({ summary: 'Get product details' })
    async findOne(@Param('id') id: string) {
        const product = await this.productService.findOne(id);
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }
}
