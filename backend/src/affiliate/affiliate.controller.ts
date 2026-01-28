
import { Controller, Get, Query } from '@nestjs/common';
import { AffiliateService } from './affiliate.service';

@Controller('affiliate')
export class AffiliateController {
    constructor(private readonly affiliateService: AffiliateService) { }

    @Get('offers')
    async getOffers(@Query('platform') platform?: string) {
        if (platform) {
            return this.affiliateService.findByPlatform(platform);
        }
        return this.affiliateService.findAll();
    }
}
