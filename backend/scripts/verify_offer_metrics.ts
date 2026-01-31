
import axios from 'axios';

async function verify() {
    try {
        const baseUrl = 'http://localhost:3000/api'; // Adjust for local testing
        console.log('--- Checking Offer Feed Metrics ---');
        const response = await axios.get(`${baseUrl}/offers/feed`);
        const offers = response.data.data;

        if (offers && offers.length > 0) {
            const first = offers[0];
            console.log(`Offer: ${first.title}`);
            console.log('Counts:', JSON.stringify(first._count, null, 2));
            console.log('Metrics:', JSON.stringify(first.offer_metrics, null, 2));

            if (first.offer_metrics && 'shares' in first.offer_metrics) {
                console.log('✅ Shares found in offer_metrics');
            } else {
                console.log('❌ Shares MISSING from offer_metrics');
            }
        } else {
            console.log('No offers found in feed.');
        }
    } catch (e) {
        console.error('Verification failed. Is the local server running and migrated?');
    }
}

verify();
