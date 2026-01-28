
import { Controller, Get, Query, Param, Post } from '@nestjs/common';
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

    @Get('stores')
    async getStores() {
        return this.affiliateService.findAllStores();
    }

    @Get('stores/:id')
    async getStore(@Param('id') id: string) {
        return this.affiliateService.findStoreById(id);
    }

    @Post('stores/:id/click')
    async trackStoreClick(@Param('id') id: string) {
        // Track click analytics here if needed
        return { success: true };
    }
}
