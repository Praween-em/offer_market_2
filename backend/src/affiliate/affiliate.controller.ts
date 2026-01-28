
import { Controller, Get, Query, Param, Post, Body } from '@nestjs/common';
import { AffiliateService } from './affiliate.service';
import { WalletService } from '../wallet/wallet.service';

@Controller('affiliate')
export class AffiliateController {
    constructor(
        private readonly affiliateService: AffiliateService,
        private readonly walletService: WalletService
    ) { }

    @Post('webhook')
    async handleWebhook(@Body() body: any, @Query() query: any) {
        // Support both Body and Query params for flexibility
        const data = Object.keys(body).length > 0 ? body : query;
        console.log('Affiliate Webhook Received:', data);

        // Map EarnKaro/Network parameters to our format
        // adjust these keys based on actual EarnKaro callback format
        const payload = {
            userId: data.subid || data.s1 || data.custom_id,
            profit: parseFloat(data.profit || data.commission || data.amount || '0'),
            networkOrderId: data.order_id || data.transaction_id || `temp_${Date.now()}`,
            platform: data.retailer || data.store || 'unknown',
            status: (data.status || 'pending').toLowerCase(), // pending, confirmed, cancelled
            notes: `Affiliate Order via ${data.retailer || 'EarnKaro'}`,
        };

        if (payload.userId) {
            await this.walletService.handleAffiliateCallback(payload);
            return { success: true, message: 'Processed' };
        }

        return { success: false, message: 'No User ID found' };
    }

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
