
import { Module } from '@nestjs/common';
import { AffiliateService } from './affiliate.service';
import { AffiliateController } from './affiliate.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
    imports: [PrismaModule, WalletModule],
    providers: [AffiliateService],
    controllers: [AffiliateController],
    exports: [AffiliateService],
})
export class AffiliateModule { }
