
import { Injectable, BadRequestException } from '@nestjs/common';
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

    async findAllCategories(providerType?: string) {
        // Return ALL active categories (both parent and subcategories) as a flat list
        // This allows frontend to display all services individually
        return this.prisma.service_categories.findMany({
            where: {
                is_active: true,
                provider_type: providerType ? providerType : undefined
            },
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


    async findOneProvider(id: string, userId?: string) {
        const provider = await this.prisma.service_providers.findUnique({
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

        if (!provider) return null;

        // Check if the user has unlocked this provider
        let isUnlocked = false;
        if (userId) {
            // If the user IS the provider, it's unlocked
            if (provider.user_id === userId) {
                isUnlocked = true;
            } else {
                const unlock = await this.prisma.provider_unlocks.findUnique({
                    where: {
                        user_id_provider_id: {
                            user_id: userId,
                            provider_id: id,
                        },
                    },
                });
                isUnlocked = !!unlock;
            }
        }

        // Helper to mask numbers
        const maskNum = (num: string | null) => {
            if (!num) return null;
            if (isUnlocked) return num;
            return `${num.substring(0, 3)}XXXXXX${num.slice(-1)}`;
        };

        const phone = maskNum(provider.phone_number || provider.users?.phone);
        const whatsapp = maskNum(provider.whatsapp_number);

        return {
            ...provider,
            phone_number: phone,
            whatsapp_number: whatsapp,
            isUnlocked,
        };
    }

    async unlockProvider(providerId: string, userId: string, adToken: string) {
        return this.prisma.provider_unlocks.upsert({
            where: {
                user_id_provider_id: {
                    user_id: userId,
                    provider_id: providerId,
                },
            },
            update: {
                ad_completion_token: adToken,
                unlocked_at: new Date(),
            },
            create: {
                user_id: userId,
                provider_id: providerId,
                ad_completion_token: adToken,
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

    async createService(providerId: string, data: { title: string; categoryId?: string; description?: string; price?: number; priceUnit?: string; images?: string[] }) {
        const { images, ...serviceData } = data;
        return this.prisma.services.create({
            data: {
                provider_id: providerId,
                category_id: serviceData.categoryId,
                title: serviceData.title,
                description: serviceData.description,
                price: serviceData.price,
                price_unit: serviceData.priceUnit || 'service',
                service_images: images ? {
                    create: images.map(url => ({ image_url: url }))
                } : undefined
            },
            include: {
                service_images: true
            }
        });
    }

    async updateService(serviceId: string, providerId: string, data: { title?: string; categoryId?: string; description?: string; price?: number; priceUnit?: string; isActive?: boolean; images?: string[] }) {
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
                service_images: data.images ? {
                    deleteMany: {},
                    create: data.images.map(url => ({ image_url: url }))
                } : undefined
            },
            include: {
                service_images: true
            }
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

    async updateServiceRequest(requestId: string, userId: string, data: {
        categoryId?: string;
        title?: string;
        description?: string;
        images?: string[];
        latitude?: number;
        longitude?: number;
    }) {
        // Ensure the request belongs to the user
        const existing = await this.prisma.service_requests.findUnique({
            where: { id: requestId },
            select: { user_id: true, latitude: true, longitude: true }
        });

        if (!existing || existing.user_id !== userId) {
            throw new BadRequestException('Request not found or not authorized');
        }

        let locationName: string | null = null;
        if ((data.latitude !== undefined && Number(data.latitude) !== Number(existing.latitude)) ||
            (data.longitude !== undefined && Number(data.longitude) !== Number(existing.longitude))) {
            if (data.latitude && data.longitude) {
                locationName = await this.locationService.reverseGeocode(
                    data.latitude,
                    data.longitude,
                );
            }
        }

        const { images, categoryId, ...remainingData } = data;

        return this.prisma.service_requests.update({
            where: { id: requestId },
            data: {
                ...remainingData,
                location_name: locationName !== null ? locationName : undefined,
                service_categories: categoryId ? {
                    connect: { id: categoryId }
                } : undefined,
                media: images ? {
                    deleteMany: {},
                    create: images.map(url => ({ image_url: url }))
                } : undefined,
                updated_at: new Date()
            },
            include: {
                media: true,
                service_categories: true
            }
        });
    }

    async findAllRequests(categoryId?: string) {
        return this.prisma.service_requests.findMany({
            where: {
                AND: [
                    categoryId ? { category_id: categoryId } : {},
                    { status: 'pending' }
                ]
            },
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

        // 2. Get the provider's category to find its parent
        const providerCategory = await this.prisma.service_categories.findUnique({
            where: { id: provider.category_id },
            select: {
                id: true,
                parent_id: true,
                name: true,
                keywords: true
            }
        });

        if (!providerCategory) return [];

        // 3. Determine the category family to match
        let categoryIds: string[] = [];

        if (providerCategory.parent_id) {
            // Provider has a parent category (e.g., "Bike Mechanic" under "Vehicle Services")
            // Fetch parent and ALL its children (siblings)
            const siblings = await this.prisma.service_categories.findMany({
                where: {
                    OR: [
                        { id: providerCategory.parent_id }, // Include parent itself
                        { parent_id: providerCategory.parent_id } // Include all siblings
                    ]
                },
                select: { id: true }
            });
            categoryIds = siblings.map(c => c.id);
        } else {
            // Provider's category IS a parent (e.g., "Electricians")
            // Include self and all children
            const children = await this.prisma.service_categories.findMany({
                where: { parent_id: providerCategory.id },
                select: { id: true }
            });
            categoryIds = [providerCategory.id, ...children.map(c => c.id)];
        }

        // 4. Build keyword list for matching
        const providerKeywords = providerCategory.keywords?.toLowerCase().split(',').map(k => k.trim()) || [];
        providerKeywords.push(providerCategory.name.toLowerCase());

        // 5. Fetch requests for these categories
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
                        profile_picture: true
                        // phone hidden until unlocked via reveal-contact
                    }
                }
            },
            orderBy: { created_at: 'desc' },
            take: 200 // Get more initially, will filter by distance
        });

        // 6. Also fetch requests that match keywords (even if category doesn't match)
        const keywordRequests: any[] = await this.prisma.service_requests.findMany({
            where: {
                status: 'pending',
                OR: providerKeywords.flatMap(keyword => [
                    { title: { contains: keyword, mode: 'insensitive' } },
                    { description: { contains: keyword, mode: 'insensitive' } }
                ])
            },
            include: {
                media: true,
                service_categories: true,
                users: {
                    select: {
                        display_name: true,
                        profile_picture: true
                        // phone hidden until unlocked via reveal-contact
                    }
                }
            },
            orderBy: { created_at: 'desc' },
            take: 50
        });

        // 7. Merge and deduplicate requests
        const requestMap = new Map();
        [...requests, ...keywordRequests].forEach(req => {
            if (!requestMap.has(req.id)) {
                requestMap.set(req.id, req);
            }
        });
        requests = Array.from(requestMap.values());

        // 8. Filter by 12km radius if location is available (live or profile)
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

            // 9. Add distance to each request
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
        // 1. Check if the provider has already unlocked this lead
        let hasUnlocked = false;
        if (providerUserId) {
            const unlock = await this.prisma.lead_unlocks.findUnique({
                where: {
                    limit_three: {
                        lead_id: requestId,
                        worker_id: providerUserId
                    }
                }
            });
            hasUnlocked = !!unlock;
        }

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
                        profile_picture: true,
                        // Include phone only if unlocked
                        phone: hasUnlocked
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
        if (obj instanceof Date || (obj && obj.constructor && obj.constructor.name === 'Decimal')) return obj;
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

