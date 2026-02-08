
import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { RevealContactController } from './reveal-contact.controller';
import { ConsentAuditModule } from '../consent-audit/consent-audit.module';
import { LocationModule } from '../location/location.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [ConsentAuditModule, LocationModule, NotificationsModule],
    controllers: [ServicesController, RevealContactController],
    providers: [ServicesService],
})
export class ServicesModule { }
