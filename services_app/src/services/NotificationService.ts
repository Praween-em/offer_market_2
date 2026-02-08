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
                try {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                    );
                    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                        console.log('[NotificationService] Notification permission granted');
                    } else {
                        console.log('[NotificationService] Notification permission denied');
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
                console.log('[NotificationService] Authorization status:', authStatus);
                await this.getToken();
            }
        } catch (error) {
            console.error('[NotificationService] requestPermission error:', error);
        }
    }

    async createDefaultChannel() {
        try {
            await notifee.createChannel({
                id: 'default',
                name: 'Default Channel',
                importance: AndroidImportance.HIGH,
                sound: 'default',
            });
        } catch (error) {
            console.error('[NotificationService] createChannel error:', error);
        }
    }

    async getToken() {
        try {
            const fcmToken = await messaging().getToken();
            if (fcmToken) {
                console.log('[NotificationService] FCM Token:', fcmToken);
                await this.saveTokenToBackend(fcmToken);
            }
        } catch (error) {
            console.log('[NotificationService] Error getting FCM token:', error);
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
                });
                await AsyncStorage.setItem('fcmToken', fcmToken);
                console.log('[NotificationService] Token registered with backend');
            }
        } catch (error) {
            console.log('[NotificationService] Error saving token to backend:', error);
        }
    }

    async setupNotificationListeners() {
        // Foreground
        const unsubscribe = messaging().onMessage(async (remoteMessage: any) => {
            console.log('[NotificationService] A new FCM message arrived!', JSON.stringify(remoteMessage));

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
        messaging().onNotificationOpenedApp((remoteMessage: any) => {
            console.log('[NotificationService] Notification caused app to open from background state:', remoteMessage.notification);
        });

        messaging().getInitialNotification().then((remoteMessage: any) => {
            if (remoteMessage) {
                console.log('[NotificationService] Notification caused app to open from quit state:', remoteMessage.notification);
            }
        });

        messaging().onTokenRefresh((token: string) => {
            console.log('[NotificationService] FCM Token refreshed:', token);
            this.saveTokenToBackend(token);
        });

        return unsubscribe;
    }
}

export default new NotificationService();
