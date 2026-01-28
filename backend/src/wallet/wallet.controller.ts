import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wallet')
export class WalletController {
    constructor(private readonly walletService: WalletService) { }

    @UseGuards(JwtAuthGuard)
    @Get('balance')
    async getBalance(@Request() req: any) {
        return this.walletService.getOrCreateWallet(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('transactions')
    async getTransactions(@Request() req: any) {
        return this.walletService.getTransactionHistory(req.user.userId);
    }

    // EarnKaro Postback Endpoint
    @Get('callback')
    async handleCallback(
        @Query('s1') userId: string,
        @Query('order_id') orderId: string,
        @Query('profit') profit: string,
        @Query('status') status: string,
        @Query('platform') platform: string,
        @Query('notes') notes: string,
    ) {
        console.log('Affiliate Callback Received:', { userId, orderId, profit, status, platform, notes });

        if (!userId || !orderId || !profit) {
            return { status: 'error', message: 'Missing required parameters' };
        }

        await this.walletService.handleAffiliateCallback({
            userId,
            profit: parseFloat(profit),
            networkOrderId: orderId,
            platform: platform || 'unknown',
            status: status || 'pending',
            notes: notes,
        });

        return { status: 'success' };
    }
}
