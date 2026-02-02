import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) { }

    async addReview(userId: string, data: { providerId: string; rating: number; comment?: string }) {
        // 1. Create the review
        const review = await this.prisma.service_reviews.create({
            data: {
                user_id: userId,
                provider_id: data.providerId,
                rating: data.rating,
                comment: data.comment,
            },
        });

        // 2. Recalculate provider ratings
        const stats = await this.prisma.service_reviews.aggregate({
            where: { provider_id: data.providerId },
            _avg: { rating: true },
            _count: { id: true },
        });

        // 3. Update the service_provider table
        await this.prisma.service_providers.update({
            where: { id: data.providerId },
            data: {
                average_rating: stats._avg.rating || 0,
                total_reviews: stats._count.id || 0,
            },
        });

        return review;
    }

    async getProviderReviews(providerId: string) {
        return this.prisma.service_reviews.findMany({
            where: { provider_id: providerId },
            include: {
                users: {
                    select: {
                        display_name: true,
                        profile_picture: true,
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }
}
