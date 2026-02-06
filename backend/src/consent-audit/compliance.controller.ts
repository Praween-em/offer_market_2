
import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ConsentAuditService } from './consent-audit.service';
import type { Request } from 'express';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Assume it exists

@Controller('compliance')
export class ComplianceController {
    constructor(private readonly complianceService: ConsentAuditService) { }

    @Get('notices/:type')
    async getLatestNotice(@Param('type') type: string) {
        return this.complianceService.getLatestNotice(type);
    }

    @Post('consent')
    // @UseGuards(JwtAuthGuard)
    async recordConsent(@Body() body: { userId: string, type: string, version: string }, @Req() req: Request) {
        const ip = req.ip || req.headers['x-forwarded-for']?.toString();
        const userAgent = req.headers['user-agent'];

        return this.complianceService.recordUserConsent({
            userId: body.userId,
            type: body.type,
            version: body.version,
            ip,
            userAgent
        });
    }

    @Get('consent-logs/:userId')
    async getConsentLogs(@Param('userId') userId: string) {
        return this.complianceService.getUserConsentLogs(userId);
    }
}
