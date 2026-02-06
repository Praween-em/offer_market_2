import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { OffersModule } from './offers/offers.module';
import { UsersModule } from './users/users.module';

import { ConfigModule } from '@nestjs/config';
import { BunnyModule } from './bunny/bunny.module';
import { MediaModule } from './media/media.module';
import { Msg91Module } from './msg91/msg91.module';
import { AiModule } from './ai/ai.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AffiliateModule } from './affiliate/affiliate.module';
import { WalletModule } from './wallet/wallet.module';
import { ServicesModule } from './services/services.module';
import { VerificationModule } from './verification/verification.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ConsentAuditModule } from './consent-audit/consent-audit.module';
import { LocationModule } from './location/location.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule,
    CategoriesModule,
    OffersModule,
    UsersModule,
    BunnyModule,
    MediaModule,
    Msg91Module,
    AiModule,
    NotificationsModule,
    AffiliateModule,
    WalletModule,
    ServicesModule,
    VerificationModule,
    ReviewsModule,
    AnalyticsModule,
    ConsentAuditModule,
    LocationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {
    console.log('✅ AppModule Initialized - Version: 2026-01-31-v1 (Services Integration)');
  }
}
