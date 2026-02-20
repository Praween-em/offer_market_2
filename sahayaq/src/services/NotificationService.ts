import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
    async requestUserPermission() {
        if (Platform.OS === 'android') {
            // Android 13+ permission
            const version = typeof Platform.Version === 'string' ? parseInt(Platform.Version, 10) : Platform.Version;
            if (version >= 33) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('Notification permission granted');
                } else {
                    console.log('Notification permission denied');
                }
            }

            // Create default channel for Android
            await this.createDefaultChannel();
        }

        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('Authorization status:', authStatus);
            await this.getToken();
        }
    }

    async createDefaultChannel() {
        await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
            importance: AndroidImportance.HIGH,
            sound: 'default',
        });
    }

    async getToken() {
        try {
            const fcmToken = await messaging().getToken();
            if (fcmToken) {
                console.log('FCM Token:', fcmToken);
                await this.saveTokenToBackend(fcmToken);
            }
        } catch (error) {
            console.log('Error getting FCM token:', error);
        }
    }

    async saveTokenToBackend(fcmToken: string) {
        try {
            const savedToken = await AsyncStorage.getItem('fcmToken');
            if (savedToken === fcmToken) return;

            const token = await AsyncStorage.getItem('access_token');
            if (token) {
                await api.post('/notifications/register-token', {
                    fcmToken,
                    platform: Platform.OS,
                    appType: 'USER',
                });
                await AsyncStorage.setItem('fcmToken', fcmToken);
                console.log('Token registered with backend');
            }
        } catch (error) {
            console.log('Error saving token to backend:', error);
        }
    }

    async getNotifications() {
        try {
            const response = await api.get('/notifications?appType=USER');
            // Filter out provider notifications in the user app (Safety fallback)
            // Provider types: NEW_REQUEST, offer_approved, offer_rejected
            const providerTypes = ['NEW_REQUEST', 'offer_approved', 'offer_rejected'];
            return response.data.filter((n: any) => !providerTypes.includes(n.notification_type));
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    async markAsRead(id: string) {
        try {
            await api.post(`/notifications/${id}/read`);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    async setupNotificationListeners() {
        // Foreground
        messaging().onMessage(async remoteMessage => {
            console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));

            const data = remoteMessage.data;
            // Filter out provider notifications in the user app
            if (data?.type === 'NEW_REQUEST') {
                console.log('[NotificationService] Filtering out NEW_REQUEST notification in User app');
                return;
            }

            // Ensure channel exists
            await this.createDefaultChannel();

            // Display a local notification using Notifee
            await notifee.displayNotification({
                title: remoteMessage.notification?.title || 'New Notification',
                body: remoteMessage.notification?.body || '',
                android: {
                    channelId: 'default',
                    importance: AndroidImportance.HIGH,
                    pressAction: {
                        id: 'default',
                    },
                    smallIcon: 'ic_launcher',
                },
            });
        });

        // Background / Quit opening logic
        messaging().onNotificationOpenedApp(remoteMessage => {
            console.log('Notification caused app to open from background state:', remoteMessage.data);
            if (remoteMessage.data?.type === 'NEW_REQUEST') {
                console.log('[NotificationService] Ignoring NEW_REQUEST background notification in User app');
                return;
            }
        });

        messaging().getInitialNotification().then(remoteMessage => {
            if (remoteMessage) {
                console.log('Notification caused app to open from quit state:', remoteMessage.data);
                if (remoteMessage.data?.type === 'NEW_REQUEST') {
                    console.log('[NotificationService] Ignoring NEW_REQUEST quit notification in User app');
                    return;
                }
            }
        });

        messaging().onTokenRefresh(token => {
            console.log('FCM Token refreshed:', token);
            this.saveTokenToBackend(token);
        });
    }
}

export default new NotificationService();
