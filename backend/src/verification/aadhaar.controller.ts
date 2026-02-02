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

@Controller('profile/verify-aadhaar')
export class AadhaarController {
    constructor(
        private readonly usersService: UsersService,
        private readonly bunnyService: BunnyService,
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
}
