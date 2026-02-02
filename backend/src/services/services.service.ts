
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
                services: {
                    include: {
                        service_categories: true,
                    },
                },
                service_portfolios: true,
            },
        });
    }

    async findProviderByUserId(userId: string) {
        return this.prisma.service_providers.findUnique({
            where: { user_id: userId },
            include: {
                services: {
                    include: {
                        service_categories: true,
                    },
                },
                service_portfolios: true,
            },
        });
    }

    async createService(providerId: string, data: { title: string; categoryId?: string; description?: string; price?: number; priceUnit?: string }) {
        return this.prisma.services.create({
            data: {
                provider_id: providerId,
                category_id: data.categoryId,
                title: data.title,
                description: data.description,
                price: data.price,
                price_unit: data.priceUnit || 'service',
            },
        });
    }

    async updateService(serviceId: string, providerId: string, data: { title?: string; categoryId?: string; description?: string; price?: number; priceUnit?: string; isActive?: boolean }) {
        // Verify ownership
        const service = await this.prisma.services.findFirst({
            where: { id: serviceId, provider_id: providerId }
        });
        if (!service) throw new Error('Service not found or unauthorized');

        return this.prisma.services.update({
            where: { id: serviceId },
            data: {
                title: data.title,
                category_id: data.categoryId,
                description: data.description,
                price: data.price,
                price_unit: data.priceUnit,
                is_active: data.isActive,
            },
        });
    }

    async deleteService(serviceId: string, providerId: string) {
        // Verify ownership
        const service = await this.prisma.services.findFirst({
            where: { id: serviceId, provider_id: providerId }
        });
        if (!service) throw new Error('Service not found or unauthorized');

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

    // Service Requests
    async createServiceRequest(userId: string, data: {
        categoryId: string;
        title: string;
        description?: string;
        images?: string[];
    }) {
        return this.prisma.service_requests.create({
            data: {
                user_id: userId,
                category_id: data.categoryId,
                title: data.title,
                description: data.description,
                media: data.images ? {
                    create: data.images.map(url => ({ image_url: url }))
                } : undefined
            },
            include: {
                media: true,
                service_categories: true
            }
        });
    }

    async findAllRequests(categoryId?: string) {
        return this.prisma.service_requests.findMany({
            where: categoryId ? { category_id: categoryId } : {},
            include: {
                media: true,
                service_categories: true,
                users: {
                    select: {
                        display_name: true,
                        profile_picture: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }

    async findRequestsByUserId(userId: string) {
        return this.prisma.service_requests.findMany({
            where: { user_id: userId },
            include: {
                media: true,
                service_categories: true
            },
            orderBy: { created_at: 'desc' }
        });
    }

    async findProviderFeed(userId: string) {
        // 1. Get the provider's category
        const provider = await this.prisma.service_providers.findUnique({
            where: { user_id: userId },
            select: { category_id: true }
        });

        if (!provider) return [];

        // 2. Fetch all related category IDs (self + all descendants)
        // For simplicity, we fetch all sub-categories of this category
        // In a real production app with deep nesting, we might use a recursive CTE
        const subCategories = await this.prisma.service_categories.findMany({
            where: { parent_id: provider.category_id },
            select: { id: true }
        });

        const categoryIds = [provider.category_id, ...subCategories.map(c => c.id)];

        // 3. Fetch requests for these categories strictly
        const requests = await this.prisma.service_requests.findMany({
            where: {
                category_id: { in: categoryIds },
                status: 'pending'
            },
            include: {
                media: true,
                service_categories: true,
                users: {
                    select: {
                        display_name: true,
                        profile_picture: true,
                        phone: true
                    }
                }
            },
            orderBy: { created_at: 'desc' },
            take: 50
        });

        return this.convertBigIntToNumber(requests);
    }

    async findRequestDetails(requestId: string) {
        const request = await this.prisma.service_requests.findUnique({
            where: { id: requestId },
            include: {
                media: true,
                service_categories: {
                    include: {
                        parent: true
                    }
                },
                users: {
                    select: {
                        id: true,
                        display_name: true,
                        profile_picture: true,
                        phone: true
                    }
                }
            }
        });

        return this.convertBigIntToNumber(request);
    }

    private convertBigIntToNumber(obj: any): any {
        if (obj === null || obj === undefined) return obj;
        if (typeof obj === 'bigint') return Number(obj);
        if (Array.isArray(obj)) return obj.map(item => this.convertBigIntToNumber(item));
        if (typeof obj === 'object') {
            const newObj = {};
            for (const key in obj) {
                newObj[key] = this.convertBigIntToNumber(obj[key]);
            }
            return newObj;
        }
        return obj;
    }
}

