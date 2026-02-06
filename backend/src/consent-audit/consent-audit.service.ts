import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConsentAuditService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get the latest version of a notice by type
     */
    async getLatestNotice(type: string) {
        const notices: any[] = await this.prisma.$queryRaw`
            SELECT * FROM consent_notices 
            WHERE type = ${type} AND is_active = true 
            ORDER BY version DESC LIMIT 1
        `;

        if (!notices || notices.length === 0) {
            throw new NotFoundException(`Consent notice of type ${type} not found`);
        }

        return notices[0];
    }

    /**
     * Record a user's consent to a specific notice version
     */
    async recordUserConsent(data: {
        userId: string,
        type: string,
        version: string,
        ip?: string,
        userAgent?: string
    }) {
        const notice = await this.getLatestNotice(data.type);
        if (!notice || notice.version !== data.version) {
            throw new Error(`Invalid notice type or version: ${data.type} v${data.version}`);
        }

        return this.prisma.$queryRaw`
            INSERT INTO consent_ledger (
                user_id,
                purpose_code,
                notice_id,
                ip_address,
                user_agent,
                consent_given_at
            ) VALUES (
                ${data.userId}::uuid,
                ${data.type},
                ${notice.id}::uuid,
                ${data.ip},
                ${data.userAgent},
                NOW()
            )
            RETURNING consent_id
        `;
    }

    /**
     * Get consent logs for a user using the new consent_ledger table
     */
    async getUserConsentLogs(userId: string) {
        return this.prisma.$queryRaw`
            SELECT 
                l.consent_id,
                l.purpose_code,
                l.consent_given_at,
                l.ip_address,
                n.version as notice_version,
                n.content as notice_content
            FROM consent_ledger l
            JOIN consent_notices n ON l.notice_id = n.id
            WHERE l.user_id = ${userId}::uuid
            ORDER BY l.consent_given_at DESC
        `;
    }

    /**
     * Legacy method for capturing artefact (kept for compatibility)
     */
    async createConsentArtefact(data: {
        workerId: string;
        userId: string;
        purposeId: string;
        eventType: string;
        metadata?: any;
    }) {
        return { success: true };
    }
}
