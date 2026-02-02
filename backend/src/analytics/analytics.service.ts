
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async trackEvent(data: {
        providerId: string;
        userId?: string;
        eventType: 'call' | 'whatsapp' | 'view';
        source: 'profile' | 'service' | 'request';
        sourceId?: string;
        metadata?: any;
    }) {
        return this.prisma.analytics_events.create({
            data: {
                provider_id: data.providerId,
                user_id: data.userId,
                event_type: data.eventType,
                source: data.source,
                source_id: data.sourceId,
                metadata: data.metadata || {},
            },
        });
    }

    async getDashboardStats(providerId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalCalls, totalWhatsapp, totalViews, todayCalls, todayWhatsapp] = await Promise.all([
            this.prisma.analytics_events.count({
                where: { provider_id: providerId, event_type: 'call' },
            }),
            this.prisma.analytics_events.count({
                where: { provider_id: providerId, event_type: 'whatsapp' },
            }),
            this.prisma.analytics_events.count({
                where: { provider_id: providerId, event_type: 'view' },
            }),
            this.prisma.analytics_events.count({
                where: { provider_id: providerId, event_type: 'call', created_at: { gte: today } },
            }),
            this.prisma.analytics_events.count({
                where: { provider_id: providerId, event_type: 'whatsapp', created_at: { gte: today } },
            }),
        ]);

        return {
            totalCalls,
            totalWhatsapp,
            totalViews,
            todayCalls,
            todayWhatsapp,
            activity: {
                calls: totalCalls,
                messages: totalWhatsapp,
                leads_contacted: 0 // Placeholder for now
            }
        };
    }

    async getProviderByUserId(userId: string) {
        return this.prisma.service_providers.findUnique({
            where: { user_id: userId },
        });
    }
}
