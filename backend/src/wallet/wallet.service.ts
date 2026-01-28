import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
    constructor(private prisma: PrismaService) { }

    async getOrCreateWallet(userId: string) {
        let wallet = await (this.prisma as any).user_wallets.findUnique({
            where: { user_id: userId },
        });

        if (!wallet) {
            wallet = await (this.prisma as any).user_wallets.create({
                data: { user_id: userId },
            });
        }

        return wallet;
    }

    async getTransactionHistory(userId: string) {
        return (this.prisma as any).cashback_transactions.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
        });
    }

    async handleAffiliateCallback(data: {
        userId: string;
        amount?: number;
        profit: number;
        networkOrderId: string;
        platform: string;
        status: string;
        notes?: string;
    }) {
        const { userId, profit, networkOrderId, platform, status, notes } = data;

        // 30% of profit goes to user
        const userShare = Number((profit * 0.3).toFixed(2));

        return await this.prisma.$transaction(async (tx) => {
            // Check if transaction already exists
            let transaction = await (tx as any).cashback_transactions.findUnique({
                where: { network_order_id: networkOrderId },
            });

            if (transaction) {
                // Update existing transaction status
                if (transaction.status !== status) {
                    const oldStatus = transaction.status;
                    const oldAmount = Number(transaction.amount);

                    transaction = await (tx as any).cashback_transactions.update({
                        where: { id: transaction.id },
                        data: {
                            status,
                            amount: userShare,
                            total_profit: profit,
                            notes: notes || transaction.notes
                        },
                    });

                    // Update wallet balances based on status change
                    await this.updateWalletBalances(tx, userId, oldStatus, status, userShare, oldAmount);
                }
            } else {
                // Create new transaction
                transaction = await (tx as any).cashback_transactions.create({
                    data: {
                        user_id: userId,
                        amount: userShare,
                        total_profit: profit,
                        network_order_id: networkOrderId,
                        platform,
                        status,
                        notes,
                    },
                });

                // Update wallet balance for new transaction
                const wallet = await this.getOrCreateWalletInternal(tx, userId);
                await (tx as any).user_wallets.update({
                    where: { id: wallet.id },
                    data: {
                        pending_balance: { increment: status === 'pending' ? userShare : 0 },
                        current_balance: { increment: status === 'confirmed' ? userShare : 0 },
                        total_earned: { increment: status === 'confirmed' ? userShare : 0 },
                    },
                });
            }

            return transaction;
        });
    }

    private async getOrCreateWalletInternal(tx: any, userId: string) {
        let wallet = await tx.user_wallets.findUnique({
            where: { user_id: userId },
        });

        if (!wallet) {
            wallet = await tx.user_wallets.create({
                data: { user_id: userId },
            });
        }

        return wallet;
    }

    private async updateWalletBalances(tx: any, userId: string, oldStatus: string, newStatus: string, newAmount: number, oldAmount: number) {
        const wallet = await this.getOrCreateWalletInternal(tx, userId);

        let pendingChange = 0;
        let currentChange = 0;
        let totalChange = 0;

        // Logic to transition between pending -> confirmed / cancelled
        if (oldStatus === 'pending' && newStatus === 'confirmed') {
            pendingChange = -oldAmount;
            currentChange = newAmount;
            totalChange = newAmount;
        } else if (oldStatus === 'pending' && newStatus === 'cancelled') {
            pendingChange = -oldAmount;
        } else if (oldStatus === 'confirmed' && newStatus === 'cancelled') {
            currentChange = -oldAmount;
            totalChange = -oldAmount;
        } else if (oldStatus === 'pending' && newStatus === 'pending') {
            // Amount might have changed
            pendingChange = newAmount - oldAmount;
        }

        await tx.user_wallets.update({
            where: { id: wallet.id },
            data: {
                pending_balance: { increment: pendingChange },
                current_balance: { increment: currentChange },
                total_earned: { increment: totalChange },
            },
        });
    }
}
