import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NavigationService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.navigation.findMany({
            include: {
                categories: {
                    take: 5, // preview
                },
            },
            orderBy: { title: 'asc' },
        });
    }

    async findOne(slug: string) {
        return this.prisma.navigation.findUnique({
            where: { slug },
            include: {
                categories: true
            }
        });
    }
}
