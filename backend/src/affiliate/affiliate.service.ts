
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AffiliateService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return (this.prisma as any).affiliate_offers.findMany({
            where: { is_active: true },
            orderBy: { created_at: 'desc' },
        });
    }

    async findByPlatform(platform: string) {
        return (this.prisma as any).affiliate_offers.findMany({
            where: { platform, is_active: true },
            orderBy: { created_at: 'desc' },
        });
    }

    async findAllStores() {
        return (this.prisma as any).affiliate_stores.findMany({
            where: { is_active: true },
            orderBy: { display_order: 'asc' },
        });
    }

    async findStoreById(id: string) {
        return (this.prisma as any).affiliate_stores.findUnique({
            where: { id },
        });
    }

    // For later: Methods to sync from Amazon/Flipkart
}
