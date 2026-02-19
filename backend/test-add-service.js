/**
 * Test script to reproduce the Add Service 500 error
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const DEV_OTP = '123456';

// Test with a provider account
const PROVIDER_PHONE = '+919876543211';

async function authenticate(phone) {
    console.log(`\n📱 Authenticating ${phone}...`);

    const response = await axios.post(`${BASE_URL}/auth/verify-otp`, {
        phone,
        otp: DEV_OTP
    });

    console.log(`✅ Authenticated: ${response.data.user.display_name || phone}`);
    return response.data.access_token;
}

async function createService(token) {
    console.log('\n📝 Creating service...');

    try {
        const response = await axios.post(
            `${BASE_URL}/services/manage`,
            {
                title: 'Test Service',
                categoryId: null, // Testing with null category
                description: 'Test description',
                price: 500,
                priceUnit: 'visit',
                isActive: true,
                images: []
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        console.log(`✅ Service created:`, response.data);
        return response.data;
    } catch (error) {
        console.error('\n❌ Create service failed:');
        console.error('Status:', error.response?.status);
        console.error('Error:', error.response?.data);
        console.error('Full error:', error.message);
        throw error;
    }
}

async function main() {
    try {
        console.log('🚀 Starting test...\n');

        const token = await authenticate(PROVIDER_PHONE);
        await createService(token);

        console.log('\n✅ TEST PASSED!');
    } catch (error) {
        console.error('\n❌ TEST FAILED');
        process.exit(1);
    }
}

main();
