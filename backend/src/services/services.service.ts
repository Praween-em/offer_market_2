
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

    async findAllProviders(categoryId?: string, search?: string) {
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
            where: {
                AND: [
                    categoryIds ? { category_id: { in: categoryIds } } : {},
                    search ? {
                        OR: [
                            { display_name: { contains: search, mode: 'insensitive' } },
                            { service_categories: { name: { contains: search, mode: 'insensitive' } } },
                            { service_area: { contains: search, mode: 'insensitive' } }
                        ]
                    } : {}
                ]
            },
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

    async findProviderByUserId(userId: string) {
        return this.prisma.service_providers.findUnique({
            where: { user_id: userId },
            include: {
                services: true,
                service_portfolios: true,
            },
        });
    }

    async createService(providerId: string, data: { title: string; description?: string; price?: number; priceUnit?: string }) {
        return this.prisma.services.create({
            data: {
                provider_id: providerId,
                title: data.title,
                description: data.description,
                price: data.price,
                price_unit: data.priceUnit || 'service',
            },
        });
    }

    async updateService(serviceId: string, data: { title?: string; description?: string; price?: number; priceUnit?: string; isActive?: boolean }) {
        return this.prisma.services.update({
            where: { id: serviceId },
            data: {
                title: data.title,
                description: data.description,
                price: data.price,
                price_unit: data.priceUnit,
                is_active: data.isActive,
            },
        });
    }

    async deleteService(serviceId: string) {
        return this.prisma.services.delete({
            where: { id: serviceId },
        });
    }

    async addPortfolioItem(providerId: string, data: { imageUrl: string; caption?: string; displayOrder?: number }) {
        return this.prisma.service_portfolios.create({
            data: {
                provider_id: providerId,
                image_url: data.imageUrl,
                caption: data.caption,
                display_order: data.displayOrder || 0,
            },
        });
    }

    async deletePortfolioItem(itemId: string) {
        return this.prisma.service_portfolios.delete({
            where: { id: itemId },
        });
    }
}

