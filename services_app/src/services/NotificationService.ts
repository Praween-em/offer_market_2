import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '../navigation/NavigationRef';

class NotificationService {
    async requestUserPermission() {
        if (Platform.OS === 'android') {
            // Android 13+ permission
            const version = typeof Platform.Version === 'string' ? parseInt(Platform.Version, 10) : Platform.Version;
            if (version >= 33) {
                try {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                    );
                    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    } else {
                    }
                } catch (error) {
                    console.error('[NotificationService] Permission request error:', error);
                }
            }

            // Create default channel for Android
            await this.createDefaultChannel();
        }

        try {
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (enabled) {
                await this.getToken();
            }
        } catch (error) {
            console.error('[NotificationService] requestPermission error:', error);
        }
    }


    async getToken() {
        try {
            const fcmToken = await messaging().getToken();
            if (fcmToken) {
                await this.saveTokenToBackend(fcmToken);
            }
        } catch (error) {
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
                    appType: 'PROVIDER',
                });
                await AsyncStorage.setItem('fcmToken', fcmToken);
            }
        } catch (error) {
        }
    }

    async getNotifications() {
        try {
            const response = await api.get('/notifications?appType=PROVIDER');
            // Filter out notifications meant for the USER app
            // User types: LEAD_UNLOCKED, new_offer, offer_expiring
            const userTypes = ['LEAD_UNLOCKED', 'new_offer', 'offer_expiring'];
            return response.data.filter((n: any) => !userTypes.includes(n.notification_type));
        } catch (error) {
            console.error('[NotificationService] Error fetching notifications:', error);
            return [];
        }
    }

    async markAsRead(id: string) {
        try {
            await api.post(`/notifications/${id}/read`);
        } catch (error) {
            console.error('[NotificationService] Error marking notification as read:', error);
        }
    }

    private showAlertHandler: ((data: any) => void) | null = null;

    setAlertHandler(handler: (data: any) => void) {
        this.showAlertHandler = handler;
    }

    async createDefaultChannel() {
        try {
            await notifee.createChannel({
                id: 'default',
                name: 'Default Channel',
                importance: AndroidImportance.HIGH,
                sound: 'default',
            });

            // Alerts channel with custom sound
            await notifee.createChannel({
                id: 'alerts',
                name: 'Job Alerts (Ring)',
                importance: AndroidImportance.HIGH,
                sound: 'alert_ring', // Must exist in android/app/src/main/res/raw
                vibration: true,
                vibrationPattern: [300, 500, 300, 500],
            });
        } catch (error) {
            console.error('[NotificationService] createChannel error:', error);
        }
    }

    async setupNotificationListeners() {
        // Foreground
        const unsubscribe = messaging().onMessage(async (remoteMessage: any) => {

            const { data } = remoteMessage;

            // Filter out notifications meant for the USER app
            if (data?.type === 'LEAD_UNLOCKED') {
                return;
            }

            const isNewRequest = data?.type === 'NEW_REQUEST' || data?.type === 'new_offer'; // Supporting both for now

            // If it's a new request and we're in foreground, trigger the "Ring System"
            if (isNewRequest && this.showAlertHandler) {
                this.showAlertHandler({
                    id: data.requestId || data.businessId,
                    title: remoteMessage.notification?.title || 'New Job Alert',
                    category: data.category || 'Service Request',
                    distance: data.distance || 'Nearby',
                    type: data.type
                });
            }

            // Display a local notification using Notifee
            await notifee.displayNotification({
                title: remoteMessage.notification?.title || 'New Notification',
                body: remoteMessage.notification?.body || '',
                android: {
                    channelId: isNewRequest ? 'alerts' : 'default',
                    importance: AndroidImportance.HIGH,
                    pressAction: {
                        id: 'default',
                    },
                    smallIcon: 'ic_launcher', // Ensure this exists in drawable
                },
            });
        });

        // Background / Quit opening logic
        messaging().onNotificationOpenedApp((remoteMessage: any) => {
            const { data } = remoteMessage;

            if (data?.type === 'LEAD_UNLOCKED') {
                return;
            }

            if (data?.requestId) {
                navigate('ServiceRequestDetails', { requestId: data.requestId });
            }
        });

        messaging().getInitialNotification().then((remoteMessage: any) => {
            if (remoteMessage) {
                const { data } = remoteMessage;

                if (data?.type === 'LEAD_UNLOCKED') {
                    return;
                }

                if (data?.requestId) {
                    // Small delay to ensure navigator is ready
                    setTimeout(() => {
                        navigate('ServiceRequestDetails', { requestId: data.requestId });
                    }, 1000);
                }
            }
        });

        messaging().onTokenRefresh((token: string) => {
            this.saveTokenToBackend(token);
        });

        return unsubscribe;
    }
}

export default new NotificationService();
