import { Module } from '@nestjs/common';
import { AadhaarController } from './aadhaar.controller';
import { UsersModule } from '../users/users.module';
import { BunnyModule } from '../bunny/bunny.module';

@Module({
    imports: [UsersModule, BunnyModule],
    controllers: [AadhaarController],
    providers: [],
})
export class VerificationModule { }
