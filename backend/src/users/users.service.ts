
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        const user = await (this.prisma as any).users.findUnique({
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
                user_verification: {
                    select: {
                        photo_base64: true,
                        full_name_xml: true,
                        verified_at: true,
                    }
                },
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

        if (user && (user as any).service_providers) {
            const provider = (user as any).service_providers;
            if (provider.is_verified) {
                user.verification_status = 'VERIFIED';
            }
            (user as any).provider = provider;
            (user as any).is_service_provider = true;
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

    async reportServiceProvider(providerId: string, userId: string, reason: any, notes?: string) {
        return this.prisma.service_provider_reports.create({
            data: {
                provider_id: providerId,
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
        // 0. Check Verification Status
        const verification = await (this.prisma as any).user_verification.findUnique({
            where: { user_id: userId },
            select: { full_name_xml: true, photo_base64: true }
        });

        const isVerified = !!verification;
        const finalDisplayName = isVerified ? verification.full_name_xml : data.display_name;
        // BUG FIX: Do NOT prioritize Aadhar photo over provided profile picture
        const finalProfilePicture = data.profile_picture || ((isVerified && verification.photo_base64) ? verification.photo_base64 : undefined);

        // 1. Update User (Personal Identity)
        await this.prisma.users.update({
            where: { id: userId },
            data: {
                display_name: finalDisplayName,
                profile_picture: finalProfilePicture,
            },
        });

        // 2. Update Business (Brand Identity) - ONLY if business fields are explicitly provided
        if (data.business_name || data.whatsapp_number || data.website) {
            await this.prisma.businesses.updateMany({
                where: { owner_id: userId },
                data: {
                    business_name: data.business_name,
                    whatsapp_number: data.whatsapp_number,
                    website: data.website,
                    // Note: We DO NOT automatically overwrite logo_url with profile_picture here
                } as any,
            });
        }

        // 3. Update Service Provider (Professional Identity)
        await this.prisma.service_providers.updateMany({
            where: { user_id: userId },
            data: {
                display_name: finalDisplayName, // Professional name usually matches personal name unless verified
                bio: data.bio,
                experience_years: data.experience_years,
                service_area: data.service_area,
                whatsapp_number: data.whatsapp_number,
                profile_picture: finalProfilePicture,
            } as any,
        });

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

    async updateVerificationStatus(userId: string, data: { status: any; metadata: any; profilePictureUrl?: string; verifiedName?: string }) {
        // 1. Update User Verification Status
        const user = await this.prisma.users.update({
            where: { id: userId },
            data: {
                verification_status: data.status,
                metadata: data.metadata,
                verified_at: data.status === 'VERIFIED' ? new Date() : null,
                // We keep users.profile_picture as the "Personal" photo
                profile_picture: data.profilePictureUrl || undefined,
                display_name: data.verifiedName || undefined,
            },
        });

        // 2. Update Service Provider (Professional Identity)
        if (data.status === 'VERIFIED') {
            await this.prisma.service_providers.updateMany({
                where: { user_id: userId },
                data: {
                    is_verified: true,
                    profile_picture: data.profilePictureUrl,
                    display_name: data.verifiedName, // Crucial: Set verified name from Aadhaar
                } as any,
            });
        }

        return user;
    }

    async getNominee(userId: string) {
        return this.prisma.user_nominees.findFirst({
            where: { user_id: userId }
        });
    }

    async updateNominee(userId: string, data: { name: string; contact: string; relationship: string }) {
        // Ensure user_verification exists first (required by schema relation)
        await this.prisma.user_verification.upsert({
            where: { user_id: userId },
            update: {},
            create: { user_id: userId }
        });

        const existing = await this.prisma.user_nominees.findFirst({
            where: { user_id: userId }
        });

        if (existing) {
            return this.prisma.user_nominees.update({
                where: { nominee_id: existing.nominee_id },
                data: {
                    nominee_name: data.name,
                    nominee_contact: data.contact,
                    relationship: data.relationship,
                    updated_at: new Date()
                }
            });
        } else {
            return this.prisma.user_nominees.create({
                data: {
                    user_id: userId,
                    nominee_name: data.name,
                    nominee_contact: data.contact,
                    relationship: data.relationship
                }
            });
        }
    }

    async verifyOkyc(userId: string, data: {
        aadhaar_number: string;
        full_name: string;
        photo_base64: string;
        isOffline?: boolean;
        demographics?: any;
        profile_picture_url?: string; // New field for Selfie
    }) {
        // 1. Ensure photo has correct data URI prefix if it's raw base64
        let finalPhoto = data.photo_base64;
        if (finalPhoto && !finalPhoto.startsWith('data:') && !finalPhoto.startsWith('http')) {
            finalPhoto = `data:image/jpeg;base64,${finalPhoto}`;
        }

        // 2. Generate MASKED AADHAAR and UID_TOKEN (SHA-256)
        // If offline, we might use referenceId instead of actual Aadhaar number if the latter is hidden
        const isActuallyAadhaar = data.aadhaar_number.length === 12 && /^\d+$/.test(data.aadhaar_number);
        const maskedAadhaar = isActuallyAadhaar ? `XXXX-XXXX-${data.aadhaar_number.slice(-4)}` : `REF-${data.aadhaar_number.slice(-6)}`;
        const crypto = require('crypto');
        const uidToken = crypto.createHash('sha256').update(data.aadhaar_number).digest('hex');

        // 2. Update user_verification record
        await this.prisma.user_verification.upsert({
            where: { user_id: userId },
            update: {
                full_name_xml: data.full_name,
                masked_aadhaar: maskedAadhaar,
                uid_token: uidToken,
                photo_base64: finalPhoto,
                verified_at: new Date()
            },
            create: {
                user_id: userId,
                full_name_xml: data.full_name,
                masked_aadhaar: maskedAadhaar,
                uid_token: uidToken,
                photo_base64: finalPhoto,
                verified_at: new Date()
            }
        });

        // 3. Store in Identity Vault (Encrypted)
        await this.prisma.identity_vault.create({
            data: {
                user_id: userId,
                encrypted_xml_data: Buffer.from(JSON.stringify(data.demographics || data)).toString('base64'),
                encryption_key_id: 'HSM_01_AES256_GCM'
            }
        });

        // 4. Update the main user status and professional identity
        // Use selfie (profile_picture_url) exclusively if available. 
        // We do NOT automatically set the Aadhar photo as the profile picture anymore.
        const finalProfilePic = data.profile_picture_url;

        return this.updateVerificationStatus(userId, {
            status: 'VERIFIED',
            verifiedName: data.full_name,
            metadata: {
                masked_aadhaar: maskedAadhaar,
                verified_via: data.isOffline ? 'OFFLINE_XML' : 'OKYC',
                verified_at: new Date().toISOString(),
                reference_id: data.isOffline ? data.aadhaar_number : undefined
            },
            profilePictureUrl: finalProfilePic
        });
    }
}
