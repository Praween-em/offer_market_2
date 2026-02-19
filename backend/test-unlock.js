
const axios = require('axios');

async function testUnlock() {
    const BASE_URL = 'http://localhost:3000/api';
    const TEST_PHONE = '9876543210';

    // 1. Login to get token (using verify-otp with bypass)
    try {
        console.log('Attempting login...');
        const loginRes = await axios.post(`${BASE_URL}/auth/verify-otp`, {
            phone: TEST_PHONE,
            otp: '123456'
        });
        const token = loginRes.data.access_token;
        console.log('Got token:', token ? 'YES' : 'NO');

        if (!token) {
            console.error('Login failed, no token returned');
            return;
        }

        // 2. Search for a provider to get an ID
        console.log('Fetching providers...');
        const providersRes = await axios.get(`${BASE_URL}/services/providers`);
        const provider = providersRes.data[0];

        if (!provider) {
            console.log('No providers found');
            return;
        }
        console.log('Testing with provider:', provider.id, provider.display_name);

        // 3. Check details BEFORE unlock
        console.log('Fetching details BEFORE unlock...');
        const beforeRes = await axios.get(`${BASE_URL}/services/providers/${provider.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Before Unlock - Is Unlocked:', beforeRes.data.isUnlocked);
        console.log('Before Unlock - Phone:', beforeRes.data.phone_number);

        // 4. Unlock
        console.log('Attempting unlock...');
        try {
            const unlockRes = await axios.post(`${BASE_URL}/services/providers/${provider.id}/unlock`, {
                adToken: 'test-ad-token-123'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Unlock successful. Response:', unlockRes.data);
        } catch (err) {
            console.error('Unlock failed:', err.response?.data || err.message);
        }

        // 5. Check details AFTER unlock
        console.log('Fetching details AFTER unlock...');
        const afterRes = await axios.get(`${BASE_URL}/services/providers/${provider.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('After Unlock - Is Unlocked:', afterRes.data.isUnlocked);
        console.log('After Unlock - Phone:', afterRes.data.phone_number);

    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
        if (error.response?.data) {
            console.log('Full error data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testUnlock();
