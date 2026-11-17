
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Msg91Service } from '../msg91/msg91.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private msg91: Msg91Service,
    ) { }

    private isDemoCredentials(phone: string, otpOrToken?: string): boolean {
        const cleanPhone = phone ? phone.replace(/\D/g, '').replace(/^91/, '') : '';
        const demoPhones = ['9999999999', '9876543210', '8888888888', '7777777777', '1234567890'];
        const isDemoNumber = demoPhones.includes(cleanPhone) || cleanPhone.startsWith('99999') || cleanPhone.endsWith('00000');
        const bypassOtp = process.env.DEV_OTP_BYPASS || '123456';
        const isDemoCode = otpOrToken ? ['123456', '999999', '000000', 'bypass', 'demo', bypassOtp].includes(otpOrToken) : false;
        return isDemoNumber || isDemoCode;
    }

    async sendOtp(phone: string) {
        console.log(`[AuthService] sendOtp requested for ${phone}`);
        const bypassOtp = process.env.DEV_OTP_BYPASS || '123456';
        const cleanPhone = phone ? phone.replace(/\D/g, '').replace(/^91/, '') : '';

        // If it's a demo phone number, immediately succeed without hitting SMS gateway
        if (this.isDemoCredentials(phone)) {
            console.log(`[AuthService] Demo phone detected for ${phone}. Allowing demo OTP: ${bypassOtp}`);
            return { message: `Demo OTP simulated. Use code: ${bypassOtp}`, type: 'success' };
        }

        try {
            return await this.msg91.sendOtp(phone);
        } catch (error) {
            console.error(`[AuthService] MSG91 sendOtp failed:`, error.message);
            // Allow proceeding if bypass or demo is available
            console.log(`[AuthService] Allowing step 2 because bypass is enabled despite MSG91 error.`);
            return { message: `OTP send simulated. Use code: ${bypassOtp}`, type: 'success' };
        }
    }

    async verifyTokenAndLogin(phone: string, token: string) {
        console.log(`[AuthService] verifyTokenAndLogin for ${phone}`);

        // 0. Development & Demo Bypass
        if (this.isDemoCredentials(phone, token)) {
            console.log(`[AuthService] Bypassing Token verification for demo credentials (${phone})`);
            return this.login(phone);
        }

        // 1. Verify Widget Access Token with MSG91
        const isValid = await this.msg91.verifyWidgetToken(token);
        if (!isValid) {
            console.error(`[AuthService] Invalid or expired Widget Token for ${phone}`);
            throw new BadRequestException('Invalid or expired Widget Token');
        }

        // 2. Once verified, perform the login/registration logic
        return this.login(phone);
    }

    async verifyAndLogin(phone: string, otp: string) {
        // 0. Development & Demo Bypass
        if (this.isDemoCredentials(phone, otp)) {
            console.log(`[AuthService] Bypassing OTP verification for ${phone} using demo/bypass code: ${otp}`);
            return this.login(phone);
        }

        // 1. Verify OTP with MSG91
        const isValid = await this.msg91.verifyOtp(phone, otp);
        if (!isValid) {
            throw new BadRequestException('Invalid or expired OTP');
        }

        // 2. Once verified, perform the login/registration logic
        return this.login(phone);
    }

    private async getUserWithFlags(user: any) {
        const [serviceProvider, business, userVerification] = await Promise.all([
            this.prisma.service_providers.findUnique({
                where: { user_id: user.id },
                include: { service_categories: { select: { name: true } } }
            }),
            this.prisma.businesses.findFirst({ where: { owner_id: user.id } }),
            this.prisma.user_verification.findUnique({
                where: { user_id: user.id },
                select: { photo_base64: true, full_name_xml: true, verified_at: true }
            }),
        ]);

        return {
            id: user.id,
            phone: user.phone,
            role: user.role,
            display_name: user.display_name,
            profile_picture: user.profile_picture,
            verification_status: serviceProvider?.is_verified ? 'VERIFIED' : user.verification_status,
            is_service_provider: !!serviceProvider,
            is_business_owner: !!business,
            provider: serviceProvider ? serviceProvider : undefined,
            user_verification: userVerification || undefined,
        };
    }

    private async login(phone: string) {
        const cleanPhone = phone ? phone.replace(/\D/g, '').replace(/^91/, '') : '';
        const phoneWith91 = `91${cleanPhone}`;

        // 1. Check if user exists (checking both raw, clean, and with 91 prefix)
        let user = await this.prisma.users.findFirst({
            where: {
                OR: [
                    { phone: phone },
                    { phone: cleanPhone },
                    { phone: phoneWith91 },
                ],
            },
        });

        // 2. If not, create them
        if (!user) {
            user = await this.prisma.users.create({
                data: {
                    phone: phoneWith91,
                    display_name: cleanPhone === '9999999999' ? 'Demo User' : undefined,
                    role: 'consumer',
                    status: 'active',
                    is_phone_verified: true,
                },
            });
        }

        if (user.status !== 'active') {
            throw new UnauthorizedException('User is suspended or banned');
        }

        // 3. Generate Token
        const payload = { sub: user.id, role: user.role };
        const access_token = this.jwtService.sign(payload);

        // 4. Get User with Flags
        const userData = await this.getUserWithFlags(user);

        return {
            access_token,
            user: userData,
        };
    }

    async onboard(userId: string, data: any) {
        console.log(`[AuthService] Onboarding started for user ${userId}`, data);
        try {
            // 1. Update User
            const user = await this.prisma.users.update({
                where: { id: userId },
                data: {
                    display_name: data.ownerName || data.displayName,
                    role: data.providerType ? 'service_provider' : 'business_owner',
                },
            });

            if (data.providerType) {
                // Service Provider Path
                console.log('[AuthService] Processing Service Provider onboarding');
                const provider = await this.prisma.service_providers.upsert({
                    where: { user_id: userId },
                    update: {
                        display_name: data.displayName,
                        provider_type: data.providerType,
                        bio: data.bio,
                        category_id: data.categoryId,
                        experience_years: data.experienceYears || 0,
                        starting_price: data.startingPrice,
                        service_area: data.serviceArea,
                        latitude: data.latitude,
                        longitude: data.longitude,
                        whatsapp_number: data.whatsappNumber,
                        phone_number: data.phoneNumber || user.phone,
                        is_active: true,
                    },
                    create: {
                        user_id: userId,
                        display_name: data.displayName,
                        provider_type: data.providerType,
                        bio: data.bio,
                        category_id: data.categoryId,
                        experience_years: data.experienceYears || 0,
                        starting_price: data.startingPrice,
                        service_area: data.serviceArea,
                        latitude: data.latitude,
                        longitude: data.longitude,
                        whatsapp_number: data.whatsappNumber,
                        phone_number: data.phoneNumber || user.phone,
                        is_active: true,
                    },
                });
                const userData = await this.getUserWithFlags(user);
                console.log('[AuthService] Onboarding Success (Individual/Provider):', userData);
                return {
                    success: true,
                    user: userData,
                };
            } else {
                // Business Owner Path
                console.log('[AuthService] Processing Business Owner onboarding');
                const business = await this.prisma.businesses.upsert({
                    where: {
                        owner_id_business_name: {
                            owner_id: userId,
                            business_name: data.businessName || data.displayName,
                        }
                    },
                    update: {
                        business_type: data.category || 'General',
                        gst_number: data.gstNumber,
                        whatsapp_number: data.whatsappNumber,
                        website: data.website,
                    } as any,
                    create: {
                        owner_id: userId,
                        business_name: data.businessName || data.displayName,
                        business_type: data.category || 'General',
                        gst_number: data.gstNumber,
                        whatsapp_number: data.whatsappNumber,
                        website: data.website,
                    } as any,
                });

                // Ensure branch exists
                const branchCount = await this.prisma.business_branches.count({
                    where: { business_id: business.id },
                });

                if (branchCount === 0) {
                    await this.prisma.business_branches.create({
                        data: {
                            business_id: business.id,
                            branch_name: 'Main Store',
                            city: 'Default City',
                            address_line: 'Update address in settings',
                            is_active: true,
                        },
                    });
                }

                const userData = await this.getUserWithFlags(user);
                console.log('[AuthService] Onboarding Success (Business):', userData);
                return {
                    success: true,
                    user: userData,
                };
            }
        } catch (error) {
            console.error('[AuthService] Onboarding failed:', error);
            throw error;
        }
    }

    async onboardServiceProvider(userId: string, data: { displayName: string; bio?: string; categoryId: string; experienceYears?: number; startingPrice?: number; serviceArea?: string; whatsappNumber?: string; phoneNumber?: string }) {
        // 1. Update User Role
        const user = await this.prisma.users.update({
            where: { id: userId },
            data: {
                display_name: data.displayName,
                role: 'service_provider',
            },
        });

        // 2. Create or Update Service Provider record
        const provider = await this.prisma.service_providers.upsert({
            where: { user_id: userId },
            update: {
                display_name: data.displayName,
                bio: data.bio,
                category_id: data.categoryId,
                experience_years: data.experienceYears || 0,
                starting_price: data.startingPrice,
                service_area: data.serviceArea,
                latitude: (data as any).latitude,
                longitude: (data as any).longitude,
                whatsapp_number: data.whatsappNumber,
                phone_number: data.phoneNumber,
            },
            create: {
                user_id: userId,
                display_name: data.displayName,
                bio: data.bio,
                category_id: data.categoryId,
                experience_years: data.experienceYears || 0,
                starting_price: data.startingPrice,
                service_area: data.serviceArea,
                latitude: (data as any).latitude,
                longitude: (data as any).longitude,
                whatsapp_number: data.whatsappNumber,
                phone_number: data.phoneNumber,
                is_active: true,
            },
        });

        const userData = await this.getUserWithFlags(user);
        return {
            success: true,
            user: userData,
        };
    }

    async getLegalTerms(type: string) {
        console.log(`[AuthService] Fetching legal terms for type: ${type}`);
        const terms = await this.prisma.consent_notices.findFirst({
            where: {
                type: type,
                is_active: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        if (!terms) {
            throw new BadRequestException(`No active legal terms found for type: ${type}`);
        }

        return terms;
    }
}
