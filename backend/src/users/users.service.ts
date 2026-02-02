
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        const user = await this.prisma.users.findUnique({
            where: { id: userId },
            select: {
                id: true,
                phone: true,
                email: true,
                display_name: true,
                profile_picture: true,
                role: true,
                verification_status: true,
                created_at: true,
                user_saved_offers: {
                    include: {
                        offers: {
                            include: {
                                offer_media: { take: 1, orderBy: { sort_order: 'asc' } },
                                business_branches: { include: { businesses: true } }
                            }
                        }
                    }
                },
                user_followed_businesses: {
                    include: {
                        businesses: true
                    }
                },
                businesses: {
                    include: {
                        business_branches: true,
                    },
                },
                _count: {
                    select: {
                        user_followed_businesses: true,
                        businesses: true,
                        offers_offers_created_byTousers: true,
                    }
                },
                service_providers: {
                    include: {
                        service_categories: {
                            select: {
                                name: true
                            }
                        },
                        services: {
                            include: {
                                service_categories: true
                            }
                        }
                    }
                },
            },
        });

        if (user && user.service_providers) {
            if (user.service_providers.is_verified) {
                user.verification_status = 'VERIFIED';
            }
            (user as any).provider = user.service_providers;
            delete (user as any).service_providers;
        }

        return this.convertBigIntToNumber(user);
    }

    async followBusiness(userId: string, businessId: string) {
        return this.prisma.user_followed_businesses.upsert({
            where: {
                user_id_business_id: {
                    user_id: userId,
                    business_id: businessId,
                },
            },
            update: {},
            create: {
                user_id: userId,
                business_id: businessId,
            },
        });
    }

    async unfollowBusiness(userId: string, businessId: string) {
        return this.prisma.user_followed_businesses.delete({
            where: {
                user_id_business_id: {
                    user_id: userId,
                    business_id: businessId,
                },
            },
        });
    }

    async reportBusiness(businessId: string, userId: string, reason: any, notes?: string) {
        return this.prisma.business_reports.create({
            data: {
                business_id: businessId,
                reported_by: userId,
                reason: reason,
                notes: notes,
                status: 'pending',
            },
        });
    }

    async updateProfile(userId: string, data: {
        display_name?: string;
        business_name?: string;
        whatsapp_number?: string;
        bio?: string;
        profile_picture?: string;
        website?: string;
        experience_years?: number;
        service_area?: string;
    }) {
        // 1. Update User
        const user = await this.prisma.users.update({
            where: { id: userId },
            data: {
                display_name: data.display_name,
                profile_picture: data.profile_picture,
            },
        });

        // 2. Update Business (if exists)
        await this.prisma.businesses.updateMany({
            where: { owner_id: userId },
            data: {
                business_name: data.business_name || data.display_name,
                whatsapp_number: data.whatsapp_number,
                bio: data.bio,
                logo_url: data.profile_picture,
                website: data.website,
            } as any,
        });

        // 3. Update Service Provider (if exists)
        await this.prisma.service_providers.updateMany({
            where: { user_id: userId },
            data: {
                display_name: data.display_name,
                bio: data.bio,
                experience_years: data.experience_years,
                service_area: data.service_area,
                whatsapp_number: data.whatsapp_number,
                profile_picture: data.profile_picture,
            } as any,
        });

        // Fetch updated user with provider for the response
        return this.getProfile(userId);
    }

    async updateBranchLocation(userId: string, data: { branchId: string; address_line?: string; city?: string; area?: string; state?: string; pincode?: string; latitude?: number; longitude?: number }) {
        // Verify the branch belongs to the user
        const branch = await this.prisma.business_branches.findFirst({
            where: {
                id: data.branchId,
                businesses: {
                    owner_id: userId,
                },
            },
        });

        if (!branch) {
            throw new Error('Branch not found or unauthorized');
        }

        return this.prisma.business_branches.update({
            where: { id: data.branchId },
            data: {
                address_line: data.address_line,
                city: data.city,
                area: data.area,
                state: data.state,
                pincode: data.pincode,
                latitude: data.latitude,
                longitude: data.longitude,
            },
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

    async findAllBusinesses() {
        return this.prisma.businesses.findMany({
            where: {
                status: 'active',
            },
            include: {
                business_branches: true,
            },
            orderBy: {
                business_name: 'asc'
            }
        });
    }

    async findOneBusiness(id: string, userId?: string) {
        const include: any = {
            business_branches: {
                include: {
                    offers: {
                        include: {
                            offer_media: { take: 1, orderBy: { sort_order: 'asc' } },
                            offer_rules: true,
                            offer_metrics: true,
                            _count: {
                                select: {
                                    offer_views: true,
                                    offer_clicks: true,
                                    offer_leads: true,
                                    user_saved_offers: true,
                                }
                            }
                        }
                    }
                }
            },
            business_metrics: true,
            _count: {
                select: {
                    user_followed_businesses: true,
                }
            }
        };

        if (userId) {
            include.user_followed_businesses = {
                where: { user_id: userId }
            };
            // Add user_saved_offers filter to offers
            include.business_branches.include.offers.include.user_saved_offers = {
                where: { user_id: userId }
            };
        }

        const business = await this.prisma.businesses.findUnique({
            where: { id },
            include
        });

        if (business) {
            // Flatten offers from all branches
            (business as any).offers = business.business_branches.flatMap(b => b.offers || []);

            if (userId) {
                (business as any).isFollowing = business.user_followed_businesses.length > 0;
                delete (business as any).user_followed_businesses;
            }

            return this.convertBigIntToNumber(business);
        }

        return business;
    }

    async updateVerificationStatus(userId: string, data: { status: any; metadata: any; profilePictureUrl?: string }) {
        // 1. Update User Verification Status
        const user = await this.prisma.users.update({
            where: { id: userId },
            data: {
                verification_status: data.status,
                metadata: data.metadata,
                verified_at: data.status === 'VERIFIED' ? new Date() : null,
                profile_picture: data.profilePictureUrl || undefined,
            },
        });

        // 2. Update Service Provider Profile Picture if provided
        if (data.profilePictureUrl) {
            await this.prisma.service_providers.updateMany({
                where: { user_id: userId },
                data: {
                    profile_picture: data.profilePictureUrl,
                } as any,
            });
        }

        return user;
    }
}
