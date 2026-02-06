import { Module } from '@nestjs/common';
import { ConsentAuditService } from './consent-audit.service';
import { ComplianceController } from './compliance.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ComplianceController],
    providers: [ConsentAuditService],
    exports: [ConsentAuditService],
})
export class ConsentAuditModule { }
