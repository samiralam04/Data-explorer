import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Find category by slug and return it with child categories (if any)
     */
    async findBySlug(slug: string) {
        return this.prisma.category.findUnique({
            where: { slug },
            include: {
                parent: true,
                children: true,
            },
        });
    }

    /**
     * Find products in a category
     */
    async findProducts(slug: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        // First resolve category ID
        const category = await this.prisma.category.findUnique({ where: { slug } });
        if (!category) return null;

        const [data, total] = await Promise.all([
            this.prisma.product.findMany({
                where: { category_id: category.id },
                skip,
                take: limit,
                orderBy: { title: 'asc' },
            }),
            this.prisma.product.count({ where: { category_id: category.id } }),
        ]);

        return {
            data,
            category, // Return full category object including source_url
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
