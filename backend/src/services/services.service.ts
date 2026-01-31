
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
    constructor(private prisma: PrismaService) { }

    async findAllCategories() {
        // Return root categories with their sub-categories nested
        return this.prisma.service_categories.findMany({
            where: { parent_id: null },
            include: {
                sub_categories: {
                    orderBy: { name: 'asc' },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    async findAllProviders(categoryId?: string) {
        let categoryIds: string[] | undefined;

        if (categoryId) {
            // Find the category and its children
            const category = await this.prisma.service_categories.findUnique({
                where: { id: categoryId },
                include: { sub_categories: { select: { id: true } } },
            });

            if (category) {
                categoryIds = [category.id, ...category.sub_categories.map((s) => s.id)];
            }
        }

        return this.prisma.service_providers.findMany({
            where: categoryIds ? { category_id: { in: categoryIds } } : {},
            include: {
                users: {
                    select: {
                        profile_picture: true,
                    },
                },
                service_categories: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }

    async findOneProvider(id: string) {
        return this.prisma.service_providers.findUnique({
            where: { id },
            include: {
                users: {
                    select: {
                        display_name: true,
                        profile_picture: true,
                        phone: true,
                    },
                },
                service_categories: true,
                services: true,
                service_portfolios: true,
            },
        });
    }
}
