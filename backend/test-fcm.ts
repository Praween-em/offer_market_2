import * as admin from 'firebase-admin';
import * as path from 'path';

// Path to your service account key file
const serviceAccountPath = path.join(__dirname, 'oferanotifications-firebase-adminsdk-fbsvc-8ab539fc02.json');

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
    });

    // GET THE TOKEN FROM YOUR MOBILE APP'S NOTIFICATION SCREEN
    const registrationToken = process.argv[2];

    if (!registrationToken) {
        console.error('Please provide a registration token as an argument.');
        console.log('Usage: npx ts-node test-fcm.ts <YOUR_TOKEN>');
        process.exit(1);
    }

    const message = {
        notification: {
            title: 'Test Notification',
            body: 'Hello from the backend script! Firebase is working.',
        },
        token: registrationToken,
    };

    admin.messaging().send(message)
        .then((response) => {
            console.log('Successfully sent message:', response);
            process.exit(0);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
            process.exit(1);
        });
} catch (e) {
    console.error('Initialization error:', e);
}
