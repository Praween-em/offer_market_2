import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    UseGuards,
    Req,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AadhaarService } from './aadhaar.service';
import { UsersService } from '../users/users.service';

@Controller('profile/verify-aadhaar')
export class AadhaarController {
    constructor(
        private readonly aadhaarService: AadhaarService,
        private readonly usersService: UsersService,
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async verifyAadhaar(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
        if (!file) {
            throw new BadRequestException('Aadhaar image or PDF is required');
        }

        const userId = req.user.userId;

        // 1. Verify Aadhaar Data (Offline)
        const verifiedData = await this.aadhaarService.verifyAadhaarQR(file.buffer);

        // 2. Update User Profile with Verified Info
        // We only store the relevant demographic details and status
        await this.usersService.updateVerificationStatus(userId, {
            status: 'VERIFIED',
            metadata: {
                extractedName: verifiedData.name,
                extractedDOB: verifiedData.dob,
                extractedGender: verifiedData.gender,
            },
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
