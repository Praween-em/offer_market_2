/**
 * Verification Script: Test Interested Providers List
 * 
 * This script simulates:
 * 1. A provider unlocking a service request (lead)
 * 2. The user (request owner) fetching their request details
 * 3. Verifying that interested_providers array is returned
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const DEV_OTP = '123456';

// Test credentials
const USER_PHONE = '+919876543210'; // Request owner
const PROVIDER_PHONE = '+919876543211'; // Provider who will unlock

let userToken = '';
let providerToken = '';
let requestId = '';

async function authenticate(phone) {
    console.log(`\n📱 Authenticating ${phone}...`);

    // Verify OTP (DEV_OTP_BYPASS allows direct verification)
    const response = await axios.post(`${BASE_URL}/auth/verify-otp`, {
        phone,
        otp: DEV_OTP
    });

    console.log(`✅ Authenticated: ${response.data.user.display_name || phone}`);
    return response.data.access_token;
}

async function createServiceRequest(token) {
    console.log('\n📝 Creating service request as user...');

    const response = await axios.post(
        `${BASE_URL}/services/requests`,
        {
            category_id: '00000000-0000-0000-0000-000000000001', // Use a valid category ID
            title: 'Test Request - Need Plumber',
            description: 'Testing interested providers list',
            latitude: 14.4426,
            longitude: 79.9865,
            location_name: 'Anantapur'
        },
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );

    console.log(`✅ Created request: ${response.data.id}`);
    return response.data.id;
}

async function unlockRequest(token, leadId) {
    console.log('\n🔓 Provider unlocking the request...');

    try {
        const response = await axios.post(
            `${BASE_URL}/services/reveal-contact`,
            {
                leadId: leadId,
                adCompletionToken: 'test-token-' + Date.now()
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        console.log(`✅ Unlocked! Phone: ${response.data.phone}`);
        return response.data;
    } catch (error) {
        console.error('❌ Unlock failed:', error.response?.data || error.message);
        throw error;
    }
}

async function fetchRequestDetails(token, requestId) {
    console.log('\n📋 Fetching request details as owner...');

    const response = await axios.get(
        `${BASE_URL}/services/request/${requestId}`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );

    console.log(`✅ Fetched request details`);
    console.log(`   - Title: ${response.data.title}`);
    console.log(`   - Unlock Count: ${response.data.unlock_count}`);
    console.log(`   - Interested Providers: ${response.data.interested_providers?.length || 0}`);

    if (response.data.interested_providers && response.data.interested_providers.length > 0) {
        console.log('\n✅ SUCCESS! Interested providers list:');
        response.data.interested_providers.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.provider.display_name}`);
            console.log(`      - Rating: ${item.provider.rating}`);
            console.log(`      - Category: ${item.provider.category_name}`);
            console.log(`      - Verified: ${item.provider.is_verified}`);
            console.log(`      - Revealed at: ${item.revealed_at}`);
        });
    } else {
        console.log('\n⚠️  No interested_providers in response');
    }

    return response.data;
}

async function main() {
    try {
        console.log('🚀 Starting verification test...\n');

        // Step 1: Authenticate user (request owner)
        userToken = await authenticate(USER_PHONE);

        // Step 2: Create a service request
        requestId = await createServiceRequest(userToken);

        // Step 3: Authenticate provider
        providerToken = await authenticate(PROVIDER_PHONE);

        // Step 4: Provider unlocks the request
        await unlockRequest(providerToken, requestId);

        // Step 5: User fetches their request details
        const requestDetails = await fetchRequestDetails(userToken, requestId);

        // Verify
        if (requestDetails.interested_providers && requestDetails.interested_providers.length > 0) {
            console.log('\n✅ VERIFICATION PASSED!');
            console.log('   The interested_providers list is correctly returned.');
        } else {
            console.log('\n❌ VERIFICATION FAILED!');
            console.log('   The interested_providers list is missing or empty.');
        }

    } catch (error) {
        console.error('\n❌ Test failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

main();
