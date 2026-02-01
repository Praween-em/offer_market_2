import { Module } from '@nestjs/common';
import { AadhaarController } from './aadhaar.controller';
import { AadhaarService } from './aadhaar.service';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule],
    controllers: [AadhaarController],
    providers: [AadhaarService],
})
export class VerificationModule { }
