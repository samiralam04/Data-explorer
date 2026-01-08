import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductService {
    constructor(private readonly prisma: PrismaService) { }

    async findOne(id: string) {
        return this.prisma.product.findUnique({
            where: { id },
            include: {
                product_detail: true,
                reviews: true,
                category: true,
            },
        });
    }
}
