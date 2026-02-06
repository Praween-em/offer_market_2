import { Module } from '@nestjs/common';
import { AadhaarController } from './aadhaar.controller';
import { UsersModule } from '../users/users.module';
import { BunnyModule } from '../bunny/bunny.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AadhaarOfflineService } from './aadhaar-offline.service';
import { CashfreeService } from './cashfree.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [UsersModule, BunnyModule, PrismaModule, ConfigModule],
    controllers: [AadhaarController],
    providers: [AadhaarOfflineService, CashfreeService],
})
export class VerificationModule { }
