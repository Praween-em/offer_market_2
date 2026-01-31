import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simulate() {
    try {
        // 1. Get a valid user (any role)
        const user = await prisma.users.findFirst();

        if (!user) {
            console.error('No consumer user found to test with.');
            return;
        }

        console.log(`Testing with User ID: ${user.id} (${user.display_name || user.phone})`);

        // 2. Prepare payload (mocking EarnKaro/Affiliate Network style)
        const payload = {
            subid: user.id, // passing our user ID
            profit: 100, // Total profit generated
            order_id: `TEST_${Date.now()}`,
            retailer: 'Amazon',
            status: 'pending'
        };

        console.log('Sending Webhook Payload:', payload);

        // 3. Send Request to Localhost
        const webhookUrl = 'http://localhost:3000/api/affiliate/webhook'; // Added /api prefix

        const response = await axios.post(webhookUrl, payload);

        console.log('Webhook Response:', response.data);

        // 4. Verify Database
        console.log('\n--- Verifying Database Updates ---');

        const tx = await prisma.cashback_transactions.findUnique({
            where: { network_order_id: payload.order_id }
        });

        if (tx) {
            console.log('✅ Transaction Created:');
            console.log(`- ID: ${tx.id}`);
            console.log(`- Amount (User Share 30%): ${tx.amount}`);
            console.log(`- Total Profit: ${tx.total_profit}`);
            console.log(`- Status: ${tx.status}`);
        } else {
            console.error('❌ Transaction NOT found in database.');
        }

        const wallet = await prisma.user_wallets.findUnique({
            where: { user_id: user.id }
        });

        if (wallet) {
            console.log('\n✅ Wallet Updated:');
            console.log(`- Pending Balance: ${wallet.pending_balance}`);
            console.log(`- Current Balance: ${wallet.current_balance}`);
        } else {
            console.error('❌ Wallet NOT found.');
        }

    } catch (error: any) {
        console.error('Simulation Failed:', error.message);
        if (error.code) console.error('Error Code:', error.code);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    } finally {
        await prisma.$disconnect();
    }
}

simulate();
