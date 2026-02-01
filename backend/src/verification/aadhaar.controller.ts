import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFiles,
    UseGuards,
    Req,
    BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AadhaarService } from './aadhaar.service';
import { UsersService } from '../users/users.service';
import { BunnyService } from '../bunny/bunny.service';

@Controller('profile/verify-aadhaar')
export class AadhaarController {
    constructor(
        private readonly aadhaarService: AadhaarService,
        private readonly usersService: UsersService,
        private readonly bunnyService: BunnyService,
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'aadhaar', maxCount: 1 },
        { name: 'selfie', maxCount: 1 },
    ]))
    async verifyAadhaar(
        @UploadedFiles() files: { aadhaar?: Express.Multer.File[], selfie?: Express.Multer.File[] },
        @Req() req: any
    ) {
        if (!files.aadhaar || !files.aadhaar[0]) {
            throw new BadRequestException('Aadhaar image or PDF is required');
        }
        if (!files.selfie || !files.selfie[0]) {
            throw new BadRequestException('Selfie is required for verification');
        }

        const userId = req.user.userId;
        const aadhaarFile = files.aadhaar[0];
        const selfieFile = files.selfie[0];

        // 1. Verify Aadhaar Data (Offline)
        const verifiedData = await this.aadhaarService.verifyAadhaarQR(aadhaarFile.buffer);

        // 2. Upload Selfie to Bunny.net
        let selfieUrl: string | undefined = undefined;
        try {
            selfieUrl = await this.bunnyService.uploadFile(selfieFile, 'profiles/service-providers');
        } catch (error) {
            console.error('Failed to upload selfie to Bunny:', error);
            // We can continue verification even if profile pic upload fails, 
            // but usually we want it to succeed. Let's make it optional for now or handle as error.
        }

        // 3. Update User Profile with Verified Info
        await this.usersService.updateVerificationStatus(userId, {
            status: 'VERIFIED',
            metadata: {
                extractedName: verifiedData.name,
                extractedDOB: verifiedData.dob,
                extractedGender: verifiedData.gender,
                selfieCaptured: true,
                selfieUrl: selfieUrl,
            },
            profilePictureUrl: selfieUrl,
        });

        return {
            message: 'Aadhaar verification successful',
            data: {
                name: verifiedData.name,
                dob: verifiedData.dob,
            },
        };
    }
}
