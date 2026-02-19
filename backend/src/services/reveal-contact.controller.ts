import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { ConsentAuditService } from '../consent-audit/consent-audit.service';
import { NotificationsService } from '../notifications/notifications.service';

@Controller('services')
export class RevealContactController {
    constructor(
        private prisma: PrismaService,
        private consentAudit: ConsentAuditService,
        private notificationsService: NotificationsService,
    ) { }

    /**
     * Rule of 3: Atomic Contact Reveal with Ad-Gate
     * This endpoint implements the atomic transaction for revealing contact information
     * with consent logging and unlock count enforcement
     */
    @UseGuards(JwtAuthGuard)
    @Post('reveal-contact')
    async revealContact(
        @Req() req,
        @Body() body: {
            leadId: string;
            adCompletionToken: string;
        }
    ) {
        const workerId = req.user.userId;
        const { leadId, adCompletionToken } = body;

        if (!leadId || !adCompletionToken) {
            throw new BadRequestException('Lead ID and ad completion token are required');
        }

        // 0. Verify worker has given LEAD_REVEAL consent (DPDP 2026)
        const activeConsent = await this.prisma.$queryRaw`
            SELECT consent_id FROM consent_ledger 
            WHERE user_id = ${workerId}::uuid 
            AND purpose_code = 'LEAD_REVEAL'
            LIMIT 1
        `;

        if (!activeConsent || (activeConsent as any[]).length === 0) {
            throw new ForbiddenException('You must provide legal consent for data processing before unlocking leads');
        }

        // Execute atomic transaction
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                // 1. Get the lead (request) with lock
                const lead: any = await tx.$queryRaw`
                    SELECT id, user_id, unlock_count, status, title
                    FROM service_requests
                    WHERE id = ${leadId}::uuid
                    FOR UPDATE
                `;

                if (!lead || lead.length === 0) {
                    throw new BadRequestException('Lead not found');
                }
                const leadData = lead[0];

                // 1.1 Get Customer (User) details
                const customer: any = await tx.$queryRaw`
                    SELECT phone, display_name FROM users WHERE id = ${leadData.user_id}::uuid
                `;
                if (!customer || customer.length === 0) {
                    throw new BadRequestException('Lead customer not found');
                }

                // 2. Verify ad completion token
                if (!adCompletionToken || adCompletionToken.length < 5) {
                    throw new BadRequestException('Invalid ad completion token');
                }

                // 3. Check if worker already unlocked this lead (using lead_unlocks)
                const existingUnlock: any = await tx.$queryRaw`
                    SELECT unlock_id FROM lead_unlocks
                    WHERE lead_id = ${leadId}::uuid AND worker_id = ${workerId}::uuid
                    LIMIT 1
                `;

                if (existingUnlock && existingUnlock.length > 0) {
                    return {
                        phone: customer[0].phone,
                        name: customer[0].display_name,
                        alreadyUnlocked: true,
                        unlockCount: leadData.unlock_count,
                    };
                }

                // 4. Check Rule of 3 (unlock_count < 3)
                if (leadData.unlock_count >= 3) {
                    throw new ForbiddenException('Lead limit reached (Rule of 3)');
                }

                // 5. Create lead_unlock record (DPDP audit)
                await tx.$executeRaw`
                    INSERT INTO lead_unlocks (lead_id, worker_id, customer_id, ad_completion_token)
                    VALUES (${leadId}::uuid, ${workerId}::uuid, ${leadData.user_id}::uuid, ${adCompletionToken})
                `;

                // 6. Increment unlock_count and update status
                const newUnlockCount = leadData.unlock_count + 1;
                const newStatus = newUnlockCount >= 3 ? 'filled' : leadData.status;

                await tx.$executeRaw`
                    UPDATE service_requests
                    SET unlock_count = ${newUnlockCount}, status = ${newStatus}
                    WHERE id = ${leadId}::uuid
                `;

                // Get Worker name for notification
                const worker: any = await tx.$queryRaw`
                    SELECT display_name FROM users WHERE id = ${workerId}::uuid
                `;

                return {
                    phone: customer[0].phone,
                    customerName: customer[0].display_name,
                    customerId: leadData.user_id,
                    unlockCount: newUnlockCount,
                    status: newStatus,
                    alreadyUnlocked: false,
                    workerName: worker[0]?.display_name || 'A service provider',
                    leadTitle: leadData.title,
                };
            });

            // 7. Send Push Notification if it was a new unlock
            if (!result.alreadyUnlocked) {
                try {
                    console.log(`[RevealContact] Sending notification to customer ${result.customerId} from worker ${result.workerName}`);
                    await this.notificationsService.sendPushNotification(
                        result.customerId,
                        'Service Provider Connected! 🚀',
                        `${result.workerName || 'A service provider'} has unlocked your request "${result.leadTitle}" and may contact you soon!`,
                        {
                            type: 'LEAD_UNLOCKED',
                            leadId: leadId,
                        },
                        'USER'
                    );
                } catch (notiError) {
                    console.error('Failed to send lead unlock notification:', notiError);
                    // Don't fail the request if notification fails
                }
            }

            return {
                success: true,
                data: {
                    phone: result.phone,
                    name: result.customerName,
                    unlockCount: result.unlockCount,
                    status: result.status,
                    alreadyUnlocked: result.alreadyUnlocked,
                },
                message: result.alreadyUnlocked ? 'Contact already unlocked' : 'Contact revealed successfully',
            };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof ForbiddenException) {
                throw error;
            }
            throw new BadRequestException('Failed to reveal contact: ' + error.message);
        }
    }

    /**
     * Get unlock status for a lead (for UI display)
     */
    @UseGuards(JwtAuthGuard)
    @Post('lead-unlock-status')
    async getLeadUnlockStatus(
        @Req() req,
        @Body() body: { leadId: string }
    ) {
        const workerId = req.user.userId;
        const { leadId } = body;
        if (!leadId) {
            throw new BadRequestException('Lead ID is required');
        }

        const lead: any = await this.prisma.$queryRaw`
            SELECT 
                id,
                unlock_count,
                status
            FROM service_requests
            WHERE id = ${leadId}::uuid
        `;

        if (!lead || lead.length === 0) {
            throw new BadRequestException('Lead not found');
        }

        const leadData = lead[0];

        // Check if worker already unlocked (using lead_unlocks)
        const hasUnlocked: any = await this.prisma.$queryRaw`
            SELECT unlock_id FROM lead_unlocks
            WHERE worker_id = ${workerId}::uuid
              AND lead_id = ${leadId}::uuid
            LIMIT 1
        `;

        return {
            unlockCount: leadData.unlock_count,
            maxUnlocks: 3,
            slotsRemaining: 3 - leadData.unlock_count,
            status: leadData.status,
            hasUnlocked: hasUnlocked && hasUnlocked.length > 0,
            canUnlock: leadData.unlock_count < 3,
        };
    }
}
