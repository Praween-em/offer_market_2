import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFiles,
    UseGuards,
    Req,
    BadRequestException,
    Body,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { BunnyService } from '../bunny/bunny.service';

import { AadhaarOfflineService } from './aadhaar-offline.service';
import { CashfreeService } from './cashfree.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';

@Controller('profile/verify-aadhaar')
export class AadhaarController {
    constructor(
        private readonly usersService: UsersService,
        private readonly bunnyService: BunnyService,
        private readonly offlineService: AadhaarOfflineService,
        private readonly cashfreeService: CashfreeService,
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'aadhaar_front', maxCount: 1 },
        { name: 'aadhaar_back', maxCount: 1 },
        { name: 'selfie', maxCount: 1 },
    ]))
    async verifyAadhaar(
        @UploadedFiles() files: { aadhaar_front?: Express.Multer.File[], aadhaar_back?: Express.Multer.File[], selfie?: Express.Multer.File[] },
        @Req() req: any
    ) {
        const userId = req.user.userId;
        const frontFile = files.aadhaar_front ? files.aadhaar_front[0] : null;
        const backFile = files.aadhaar_back ? files.aadhaar_back[0] : null;
        const selfieFile = files.selfie ? files.selfie[0] : null;

        if (!frontFile || !backFile || !selfieFile) {
            throw new BadRequestException('Aadhaar front, back, and selfie are all required');
        }

        // 1. Upload documents to Bunny.net
        let frontUrl, backUrl, selfieUrl;

        try {
            const folder = `verifications/user-${userId}`;
            [frontUrl, backUrl, selfieUrl] = await Promise.all([
                this.bunnyService.uploadFile(frontFile, folder),
                this.bunnyService.uploadFile(backFile, folder),
                this.bunnyService.uploadFile(selfieFile, folder),
            ]);
        } catch (error) {
            console.error('Failed to upload documents to Bunny:', error);
            throw new BadRequestException('Failed to upload verification documents');
        }

        // 2. Update User Profile with Pending Status and Metadata
        await this.usersService.updateVerificationStatus(userId, {
            status: 'PENDING' as any,
            metadata: {
                aadhaar_front_url: frontUrl,
                aadhaar_back_url: backUrl,
                selfie_url: selfieUrl,
                submitted_at: new Date().toISOString(),
            },
            profilePictureUrl: selfieUrl, // Also set selfie as profile pic
        });

        return {
            message: 'Documents submitted successfully for manual review',
            status: 'PENDING',
            selfieUrl: selfieUrl,
        };
    }

    @Post('okyc-init')
    @UseGuards(JwtAuthGuard)
    async okycInit(@Body('aadhaar_number') aadhaarNumber: string) {
        if (!aadhaarNumber || aadhaarNumber.length !== 12) {
            throw new BadRequestException('Valid 12-digit Aadhaar number is required');
        }

        return this.cashfreeService.initiateAadhaarOtp(aadhaarNumber);
    }

    @Post('okyc-verify')
    @UseGuards(JwtAuthGuard)
    async okycVerify(
        @Req() req: any,
        @Body() data: { otp: string; client_id: string; aadhaar_number: string; full_name: string; photo_base64?: string }
    ) {
        if (!data.otp || !data.client_id) {
            throw new BadRequestException('OTP and Client ID (ref_id) are required');
        }

        // 1. Verify with Cashfree
        const cashfreeData = await this.cashfreeService.verifyAadhaarOtp(data.otp, data.client_id);

        // 2. Process verification in UsersService
        return this.usersService.verifyOkyc(req.user.userId, {
            aadhaar_number: data.aadhaar_number,
            full_name: cashfreeData.name, // Use name from Cashfree
            photo_base64: cashfreeData.pht || data.photo_base64 || '',
            demographics: cashfreeData
        });
    }

    @Post('verify-offline')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'aadhaar_zip', maxCount: 1 },
        { name: 'selfie', maxCount: 1 },
    ]))
    async verifyOffline(
        @Req() req: any,
        @UploadedFiles() files: { aadhaar_zip?: Express.Multer.File[], selfie?: Express.Multer.File[] },
        @Body('share_code') shareCode: string
    ) {
        try {
            const zipFile = files.aadhaar_zip ? files.aadhaar_zip[0] : null;
            const selfieFile = files.selfie ? files.selfie[0] : null;

            if (!zipFile || !shareCode) {
                throw new BadRequestException('Aadhaar ZIP file and Share Code are required');
            }
            if (!selfieFile) {
                throw new BadRequestException('Selfie is required for verification');
            }

            // 1. Upload Selfie to Bunny.net
            let selfieUrl = '';
            try {
                const folder = `verifications/user-${req.user.userId}`;
                selfieUrl = await this.bunnyService.uploadFile(selfieFile, folder);
            } catch (error) {
                console.error('Failed to upload selfie:', error);
                throw new BadRequestException('Failed to upload selfie image');
            }

            // 2. Verify XML Demographics and Signature
            const demographics = await this.offlineService.verifyOfflineXml(zipFile.buffer, shareCode);

            // 3. Map offline data to OKYC verification flow
            // The photo comes in the XML as base64 string
            return await this.usersService.verifyOkyc(req.user.userId, {
                aadhaar_number: demographics.referenceId, // Reference ID acts as a token for the session
                full_name: demographics.name,
                photo_base64: demographics.photo,
                isOffline: true,
                demographics: demographics,
                profile_picture_url: selfieUrl
            });
        } catch (error) {
            console.error('Offline Verification Fatal Error:', error);
            throw new BadRequestException(error.message || 'Internal processing error during verification');
        }
    }
}
