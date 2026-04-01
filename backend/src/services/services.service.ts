
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LocationService } from '../location/location.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ServicesService {
    constructor(
        private prisma: PrismaService,
        private locationService: LocationService,
        private notificationsService: NotificationsService,
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
                        service_images: true,
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
                        service_images: true,
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
                category_id: serviceData.categoryId && serviceData.categoryId.trim() !== '' ? serviceData.categoryId : null,
                title: serviceData.title,
                description: serviceData.description,
                price: serviceData.price,
                price_unit: serviceData.priceUnit || 'service',
                service_images: images && images.length > 0 ? {
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
                category_id: data.categoryId !== undefined
                    ? (data.categoryId && data.categoryId.trim() !== '' ? data.categoryId : null)
                    : undefined,
                description: data.description,
                price: data.price,
                price_unit: data.priceUnit,
                is_active: data.isActive,
                service_images: data.images && data.images.length > 0 ? {
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
        budget?: number;
        urgency?: string;
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

        const result = await this.prisma.service_requests.create({
            data: {
                title: data.title,
                description: data.description,
                latitude: data.latitude,
                longitude: data.longitude,
                location_name: locationName,
                budget: data.budget,
                urgency: data.urgency || 'medium',
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

        // Trigger notifications to nearby providers (async)
        this.notifyNearbyProviders(result.id, data.categoryId, data.latitude, data.longitude, data.title).catch(err => {
            console.error('Failed to notify providers for new request:', err);
        });

        return result;
    }

    async notifyNearbyProviders(requestId: string, categoryId: string, lat?: number, lng?: number, title?: string) {
        if (!lat || !lng) return;

        // 1. Get the category and its relatives (parent/children)
        const category = await this.prisma.service_categories.findUnique({
            where: { id: categoryId },
            include: { sub_categories: { select: { id: true } } }
        });

        if (!category) return;

        const categoryIds = [category.id, ...category.sub_categories.map(s => s.id)];
        if (category.parent_id) {
            categoryIds.push(category.parent_id);
            // Also get siblings
            const siblings = await this.prisma.service_categories.findMany({
                where: { parent_id: category.parent_id },
                select: { id: true }
            });
            siblings.forEach(s => {
                if (!categoryIds.includes(s.id)) categoryIds.push(s.id);
            });
        }

        // 2. Find providers in these categories
        const providers = await this.prisma.service_providers.findMany({
            where: {
                category_id: { in: categoryIds },
                is_active: true,
            },
            select: {
                user_id: true,
                latitude: true,
                longitude: true
            }
        });

        const RADIUS_KM = 12;
        const targetUserIds: string[] = [];

        for (const provider of providers) {
            if (provider.latitude && provider.longitude) {
                const distance = this.locationService.calculateDistance(
                    Number(lat),
                    Number(lng),
                    Number(provider.latitude),
                    Number(provider.longitude)
                );
                if (distance <= RADIUS_KM) {
                    targetUserIds.push(provider.user_id);
                }
            }
        }

        if (targetUserIds.length > 0) {
            console.log(`Notifying ${targetUserIds.length} providers about new request: ${requestId}`);
            for (const pUserId of targetUserIds) {
                this.notificationsService.sendPushNotification(
                    pUserId,
                    'New Job Nearby! 📍',
                    `A new request for "${title}" has been posted near your location.`,
                    {
                        type: 'NEW_REQUEST',
                        requestId: requestId,
                    },
                    'PROVIDER'
                ).catch(err => console.error(`Failed to notify provider ${pUserId}:`, err));
            }
        }
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
        const requests = await this.prisma.service_requests.findMany({
            where: { user_id: userId },
            include: {
                media: true,
                service_categories: true
            },
            orderBy: { created_at: 'desc' }
        });

        // For each request, calculate new activity
        const requestsWithActivity = await Promise.all(
            requests.map(async (request) => {
                // Count total unlocks
                const unlockCount = await this.prisma.lead_unlocks.count({
                    where: { lead_id: request.id },
                });

                // Count new unlocks since last viewed
                const lastViewed = request.last_viewed_at || request.created_at;
                const newUnlockCount = await this.prisma.lead_unlocks.count({
                    where: {
                        lead_id: request.id,
                        revealed_at: {
                            gt: lastViewed,
                        },
                    },
                });

                // Get latest activity timestamp
                const latestUnlock = await this.prisma.lead_unlocks.findFirst({
                    where: { lead_id: request.id },
                    orderBy: { revealed_at: 'desc' },
                    select: { revealed_at: true },
                });

                return {
                    ...request,
                    unlock_count: unlockCount,
                    new_unlock_count: newUnlockCount,
                    has_new_activity: newUnlockCount > 0,
                    latest_activity_at: latestUnlock?.revealed_at || null,
                };
            })
        );

        console.log('Sample request with activity:', requestsWithActivity[0]);
        return this.convertBigIntToNumber(requestsWithActivity);
    }

    async getSelectedCategories(providerId: string): Promise<string[]> {
        const rows = await (this.prisma as any).provider_selected_categories.findMany({
            where: { provider_id: providerId },
            select: { category_id: true },
        });
        return rows.map((r: any) => r.category_id);
    }

    async saveSelectedCategories(providerId: string, categoryIds: string[]): Promise<void> {
        await (this.prisma as any).provider_selected_categories.deleteMany({
            where: { provider_id: providerId },
        });
        if (categoryIds.length > 0) {
            await (this.prisma as any).provider_selected_categories.createMany({
                data: categoryIds.map(cid => ({ provider_id: providerId, category_id: cid })),
                skipDuplicates: true,
            });
        }
    }

    async findProviderFeed(userId: string, lat?: number, lng?: number) {
        // 1. Get the provider's category and location
        const provider: any = await this.prisma.service_providers.findUnique({
            where: { user_id: userId },
            select: {
                id: true,
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

        // 3. Determine the category family to match (primary category)
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

        // 3b. Expand with any extra categories the provider has opted into
        const selectedCategoryIds = await this.getSelectedCategories(provider.id);
        for (const scId of selectedCategoryIds) {
            if (categoryIds.includes(scId)) continue;
            const sc = await this.prisma.service_categories.findUnique({
                where: { id: scId },
                select: { id: true, parent_id: true }
            });
            if (!sc) continue;
            if (sc.parent_id) {
                const extra = await this.prisma.service_categories.findMany({
                    where: {
                        OR: [
                            { id: sc.parent_id },
                            { parent_id: sc.parent_id }
                        ]
                    },
                    select: { id: true }
                });
                extra.forEach(e => { if (!categoryIds.includes(e.id)) categoryIds.push(e.id); });
            } else {
                if (!categoryIds.includes(sc.id)) categoryIds.push(sc.id);
                const children = await this.prisma.service_categories.findMany({
                    where: { parent_id: sc.id },
                    select: { id: true }
                });
                children.forEach(c => { if (!categoryIds.includes(c.id)) categoryIds.push(c.id); });
            }
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
        // 1. Check if the provider has already unlocked this lead (for provider view)
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

        // 2. If the requester is the OWNER, attach the list of "Responses & Bids" (providers who unlocked)
        if (providerUserId && request.user_id === providerUserId) {
            const unlocks = await this.prisma.lead_unlocks.findMany({
                where: { lead_id: requestId },
                include: {
                    users: {
                        select: {
                            id: true,
                            display_name: true,
                            profile_picture: true,
                            service_providers: {
                                select: {
                                    id: true,
                                    is_verified: true,
                                    average_rating: true,
                                    total_reviews: true,
                                    category_id: true,
                                    display_name: true,
                                    service_categories: {
                                        select: { name: true }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: { revealed_at: 'desc' }
            });

            result.interested_providers = unlocks.map(u => ({
                unlock_id: u.unlock_id,
                revealed_at: u.revealed_at,
                provider: {
                    user_id: u.users.id,
                    display_name: u.users.display_name || u.users.service_providers?.display_name || 'Service Provider',
                    profile_picture: u.users.profile_picture,
                    id: u.users.service_providers?.id,
                    is_verified: u.users.service_providers?.is_verified,
                    rating: u.users.service_providers?.average_rating,
                    reviews: u.users.service_providers?.total_reviews,
                    category_name: u.users.service_providers?.service_categories?.name
                }
            }));

            // Ensure numbers are converted for this new array as well
            result.interested_providers = this.convertBigIntToNumber(result.interested_providers);
        }

        // Add distance if providerUserId is provided AND it's NOT the owner (i.e. viewing as a provider)
        if (providerUserId && request.user_id !== providerUserId && (request as any).latitude && (request as any).longitude) {
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

    async markRequestAsViewed(requestId: string, userId: string) {
        const request = await this.prisma.service_requests.findFirst({
            where: { id: requestId, user_id: userId }
        });

        if (!request) {
            throw new Error('Request not found or unauthorized');
        }

        return this.prisma.service_requests.update({
            where: { id: requestId },
            data: { last_viewed_at: new Date() }
        });
    }

    private convertBigIntToNumber(obj: any): any {
        if (obj === null || obj === undefined) return obj;
        if (typeof obj === 'bigint') return Number(obj);
        if (Array.isArray(obj)) return obj.map(item => this.convertBigIntToNumber(item));
        if (obj instanceof Date) return obj;
        // Convert Prisma Decimal to plain string so it serializes correctly in JSON
        if (obj && obj.constructor && obj.constructor.name === 'Decimal') return obj.toString();
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

