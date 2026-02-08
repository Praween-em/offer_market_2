import { PermissionsAndroid, Platform, Linking } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface LocationData {
    latitude: number;
    longitude: number;
    accuracy?: number;
}

class LocationServiceClass {
    private lastKnownLocation: LocationData | null = null;

    /**
     * Request location permission from the user
     * Returns permission status string
     */
    async requestLocationPermission(): Promise<'granted' | 'denied' | 'never_ask_again'> {
        if (Platform.OS === 'ios') {
            return 'granted';
        }

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message: 'Sahayaq needs your location to find nearby jobs and service requests for you.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );

            if (granted === PermissionsAndroid.RESULTS.GRANTED) return 'granted';
            if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) return 'never_ask_again';
            return 'denied';
        } catch (err) {
            console.warn('Location permission error:', err);
            return 'denied';
        }
    }

    /**
     * Check current permission status
     */
    async checkPermissionStatus(): Promise<string> {
        if (Platform.OS === 'ios') return 'granted';

        try {
            const status = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            if (status) return 'granted';

            // If not granted, we check if it's denied or blocked
            // This is tricky with PermissionsAndroid.check, it only returns boolean.
            // We'll rely on the request result instead for blocking.
            return 'denied';
        } catch (err) {
            return 'error';
        }
    }

    /**
     * Open App Settings
     */
    async openSettings() {
        try {
            await Linking.openSettings();
        } catch (err) {
            console.error('Failed to open settings:', err);
        }
    }

    /**
     * Get current location
     */
    async getCurrentLocation(): Promise<LocationData | null> {
        const status = await this.requestLocationPermission();
        if (status !== 'granted') {
            return this.lastKnownLocation;
        }

        return new Promise((resolve) => {
            Geolocation.getCurrentPosition(
                (position) => {
                    const location: LocationData = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                    };
                    this.lastKnownLocation = location;
                    resolve(location);
                },
                (error) => {
                    console.warn('High Accuracy Location failed, trying low accuracy...', error);
                    // Fallback to low accuracy
                    Geolocation.getCurrentPosition(
                        (lowAccuracyPos) => {
                            const location: LocationData = {
                                latitude: lowAccuracyPos.coords.latitude,
                                longitude: lowAccuracyPos.coords.longitude,
                                accuracy: lowAccuracyPos.coords.accuracy,
                            };
                            this.lastKnownLocation = location;
                            resolve(location);
                        },
                        (lowAccuracyError) => {
                            console.error('All location attempts failed:', lowAccuracyError);
                            resolve(this.lastKnownLocation);
                        },
                        { enableHighAccuracy: false, timeout: 10000, maximumAge: 10000 }
                    );
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 10000,
                },
            );
        });
    }

    /**
     * Get last known location (cached)
     */
    getLastKnownLocation(): LocationData | null {
        return this.lastKnownLocation;
    }

    /**
     * Clear cached location
     */
    clearCache(): void {
        this.lastKnownLocation = null;
    }

    /**
     * Reverse geocode coordinates to a human-readable address
     */
    async reverseGeocode(lat: number, lon: number): Promise<string> {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
                { headers: { 'User-Agent': 'Sahayaq-App' } }
            );
            const data = await response.json();

            if (data && data.display_name) {
                const address = data.address;
                const city = address.city || address.town || address.village || address.suburb || '';
                const road = address.road || '';
                const neighbourhood = address.neighbourhood || address.suburb || '';

                // Construct a shorter, more relevant address for "Service Area"
                if (neighbourhood && city) return `${neighbourhood}, ${city}`;
                if (road && city) return `${road}, ${city}`;
                return city || data.display_name;
            }
            return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
            return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        }
    }
}

export const LocationService = new LocationServiceClass();
