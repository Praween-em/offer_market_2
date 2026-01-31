
import axios from 'axios';

async function verify() {
    try {
        const baseUrl = 'http://localhost:3000/api'; // Adjust if needed
        console.log('--- Categories ---');
        const cats = await axios.get(`${baseUrl}/services/categories`);
        console.log(JSON.stringify(cats.data[0], null, 2));

        console.log('\n--- Providers ---');
        const providers = await axios.get(`${baseUrl}/services/providers`);
        console.log(JSON.stringify(providers.data[0], null, 2));
    } catch (e) {
        console.error('Verification failed. Is the server running?');
    }
}

verify();
