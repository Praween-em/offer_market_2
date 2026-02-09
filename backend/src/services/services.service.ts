
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LocationService } from '../location/location.service';

@Injectable()
export class ServicesService {
    constructor(
        private prisma: PrismaService,
        private locationService: LocationService,
    ) { }

    async reportServiceRequest(requestId: string, reportedBy: string, reason: any, notes?: string) {
        return this.prisma.service_request_reports.create({
            data: {
                request_id: requestId,
                reported_by: reportedBy,
                reason: reason,
                notes: notes,
                status: 'pending',
            },
        });
    }

    async findAllCategories() {
        // Return ALL active categories (both parent and subcategories) as a flat list
        // This allows frontend to display all services individually
        return this.prisma.service_categories.findMany({
            where: { is_active: true },
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    async findAllProviders(categoryId?: string, search?: string, lat?: number, lng?: number, radiusKm: number = 12) {
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

        const where: any = {
            AND: [
                categoryIds ? { category_id: { in: categoryIds } } : {},
                { is_active: true }
            ]
        };

        if (search) {
            const rawTokens = search.split(/\s+/).filter(t => t.length > 0);
            if (rawTokens.length > 0) {
                const tokenFilters = rawTokens.map(token => {
                    const variants = [token];
                    // Basic pluralization/singularization
                    if (token.toLowerCase().endsWith('s') && token.length > 3) {
                        variants.push(token.slice(0, -1));
                    } else if (token.length > 3) {
                        variants.push(token + 's');
                    }

                    return {
                        OR: variants.flatMap(v => [
                            { display_name: { contains: v, mode: 'insensitive' } },
                            { keywords: { contains: v, mode: 'insensitive' } },
                            { service_area: { contains: v, mode: 'insensitive' } },
                            {
                                service_categories: {
                                    OR: [
                                        { name: { contains: v, mode: 'insensitive' } },
                                        { keywords: { contains: v, mode: 'insensitive' } }
                                    ]
                                }
                            },
                            {
                                services: {
                                    some: {
                                        OR: [
                                            { title: { contains: v, mode: 'insensitive' } },
                                            { description: { contains: v, mode: 'insensitive' } },
                                            { price_unit: { contains: v, mode: 'insensitive' } }
                                        ],
                                        is_active: true
                                    }
                                }
                            }
                        ])
                    };
                });
                where.AND.push(...tokenFilters);
            }
        }


        const providers = await this.prisma.service_providers.findMany({
            where,
            include: {
                users: {
                    select: {
                        profile_picture: true,
                    },
                },
                service_categories: true,
            },
            orderBy: [
                { is_verified: 'desc' },
                { created_at: 'desc' }
            ],
        });

        let results = this.convertBigIntToNumber(providers);

        // Filter by radius if lat/lng are provided
        if (lat && lng) {
            results = results.map(provider => {
                let distance: number | null = null;
                if ((provider as any).latitude && (provider as any).longitude) {
                    distance = this.locationService.calculateDistance(
                        lat,
                        lng,
                        Number((provider as any).latitude),
                        Number((provider as any).longitude)
                    );
                }
                return { ...provider, distance_km: distance } as any;
            });

            // Filter out providers beyond radiusKm if specified
            if (radiusKm > 0) {
                results = results.filter(provider => {
                    if (provider.distance_km === null) return false; // Hide if no location when radius is set
                    return provider.distance_km <= radiusKm;
                });
            }

            // Sort by distance if location is provided
            results.sort((a: any, b: any) => {
                if (a.distance_km === null) return 1;
                if (b.distance_km === null) return -1;
                return a.distance_km - b.distance_km;
            });

            // Re-apply verification boost after distance sort
            results.sort((a, b) => {
                if (a.is_verified && !b.is_verified) return -1;
                if (!a.is_verified && b.is_verified) return 1;
                return 0;
            });
        }

        return results;
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
        latitude?: number;
        longitude?: number;
    }) {
        // Optional: Get location name if coordinates provided
        let locationName: string | null = null;
        if (data.latitude && data.longitude) {
            locationName = await this.locationService.reverseGeocode(
                data.latitude,
                data.longitude,
            );
        }

        const { images, ...remainingData } = data;

        return this.prisma.service_requests.create({
            data: {
                title: data.title,
                description: data.description,
                latitude: data.latitude,
                longitude: data.longitude,
                location_name: locationName,
                users: {
                    connect: { id: userId }
                },
                service_categories: {
                    connect: { id: data.categoryId }
                },
                media: images ? {
                    create: images.map(url => ({ image_url: url }))
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

    async findProviderFeed(userId: string, lat?: number, lng?: number) {
        // 1. Get the provider's category and location
        const provider: any = await this.prisma.service_providers.findUnique({
            where: { user_id: userId },
            select: {
                category_id: true,
                latitude: true,
                longitude: true
            } as any
        });

        if (!provider) return [];

        // Override provider location with live coordinates if provided
        const effectiveLat = lat !== undefined ? lat : (provider.latitude ? Number(provider.latitude) : null);
        const effectiveLng = lng !== undefined ? lng : (provider.longitude ? Number(provider.longitude) : null);

        // 2. Fetch all related category IDs (self + all descendants)
        const subCategories = await this.prisma.service_categories.findMany({
            where: { parent_id: provider.category_id },
            select: { id: true }
        });

        const categoryIds = [provider.category_id, ...subCategories.map(c => c.id)];

        // 3. Fetch requests for these categories
        let requests: any[] = await this.prisma.service_requests.findMany({
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
            take: 200 // Get more initially, will filter by distance
        });

        // 4. Filter by 12km radius if location is available (live or profile)
        let filteredRequests = requests;
        if (effectiveLat && effectiveLng) {
            const RADIUS_KM = 12;
            filteredRequests = requests.filter(request => {
                // If request has no location, include it (backward compatibility)
                if (!(request as any).latitude || !(request as any).longitude) {
                    return true;
                }

                return this.locationService.isWithinRadius(
                    Number(effectiveLat),
                    Number(effectiveLng),
                    Number((request as any).latitude),
                    Number((request as any).longitude),
                    RADIUS_KM
                );
            });

            // 5. Add distance to each request
            filteredRequests = filteredRequests.map(request => {
                let distance: number | null = null;
                if ((request as any).latitude && (request as any).longitude) {
                    distance = this.locationService.calculateDistance(
                        Number(effectiveLat),
                        Number(effectiveLng),
                        Number((request as any).latitude),
                        Number((request as any).longitude)
                    );
                }

                return {
                    ...request,
                    distance_km: distance
                } as any;
            });

            // Sort by distance (closest first), then by created_at
            filteredRequests.sort((a: any, b: any) => {
                if (a.distance_km === null && b.distance_km === null) {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                }
                if (a.distance_km === null) return 1;
                if (b.distance_km === null) return -1;
                return a.distance_km - b.distance_km;
            });
        }

        return this.convertBigIntToNumber(filteredRequests.slice(0, 50));
    }

    async findRequestDetails(requestId: string, providerUserId?: string) {
        const request: any = await this.prisma.service_requests.findUnique({
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
                        profile_picture: true
                        // phone hidden until unlocked via reveal-contact
                    }
                }
            }
        });

        if (!request) return null;

        let result = this.convertBigIntToNumber(request);

        // Add distance if providerUserId is provided
        if (providerUserId && (request as any).latitude && (request as any).longitude) {
            const provider: any = await this.prisma.service_providers.findUnique({
                where: { user_id: providerUserId },
                select: { latitude: true, longitude: true } as any
            });

            if ((provider as any)?.latitude && (provider as any)?.longitude) {
                const distance = this.locationService.calculateDistance(
                    Number((provider as any).latitude),
                    Number((provider as any).longitude),
                    Number((request as any).latitude),
                    Number((request as any).longitude)
                );
                result.distance_km = distance;
            }
        }

        return result;
    }

    async reactivateRequest(requestId: string, userId: string) {
        // Verify ownership
        const request = await this.prisma.service_requests.findFirst({
            where: { id: requestId, user_id: userId }
        });

        if (!request) {
            throw new Error('Request not found or unauthorized');
        }

        return this.prisma.service_requests.update({
            where: { id: requestId },
            data: {
                unlock_count: 0,
                status: 'pending',
                updated_at: new Date()
            }
        });
    }

    async cancelRequest(requestId: string, userId: string) {
        // Verify ownership
        const request = await this.prisma.service_requests.findFirst({
            where: { id: requestId, user_id: userId }
        });

        if (!request) {
            throw new Error('Request not found or unauthorized');
        }

        return this.prisma.service_requests.update({
            where: { id: requestId },
            data: {
                status: 'cancelled',
                updated_at: new Date()
            }
        });
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

