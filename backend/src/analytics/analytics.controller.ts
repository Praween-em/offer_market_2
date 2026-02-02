
import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
export class AnalyticsController {
    constructor(private analyticsService: AnalyticsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('track')
    async trackEvent(@Body() body: any, @Request() req) {
        // If the tracker is a user (e.g. tracking inbound profile view), userId comes from token.
        // If tracker is provider (outbound), logic might differ, but for now assumption is User App tracks inbound.

        return this.analyticsService.trackEvent({
            providerId: body.providerId,
            userId: req.user.userId,
            eventType: body.eventType,
            source: body.source,
            sourceId: body.sourceId,
            metadata: body.metadata,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get('dashboard')
    async getDashboardStats(@Request() req) {
        const user = req.user;
        const provider = await this.analyticsService.getProviderByUserId(user.userId);

        if (!provider) {
            return {
                totalCalls: 0,
                totalWhatsapp: 0,
                totalViews: 0,
                todayCalls: 0,
                todayWhatsapp: 0,
                activity: { calls: 0, messages: 0, leads_contacted: 0 }
            };
        }

        return this.analyticsService.getDashboardStats(provider.id);
    }
}
