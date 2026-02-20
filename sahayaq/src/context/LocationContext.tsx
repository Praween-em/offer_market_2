import React, { createContext, useState, useContext, useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LocationData = {
    latitude: number | null;
    longitude: number | null;
    address: string | null;
};

type LocationContextType = {
    location: LocationData;
    isLoading: boolean;
    updateLocation: (lat: number, lng: number, address?: string) => Promise<void>;
    detectLocation: () => Promise<{ lat: number, lng: number } | null>;
    requestPermission: () => Promise<boolean>;
    clearLocation: () => Promise<void>;
    checkLocationPermissionOnLoad: () => Promise<void>;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [location, setLocation] = useState<LocationData>({
        latitude: null,
        longitude: null,
        address: null,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSavedLocation();
    }, []);

    const loadSavedLocation = async () => {
        try {
            const savedLocation = await AsyncStorage.getItem('user_location');
            if (savedLocation) {
                setLocation(JSON.parse(savedLocation));
            }
        } catch (error) {
            console.error('Failed to load location:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const requestPermission = async () => {
        if (Platform.OS === 'ios') {
            Geolocation.requestAuthorization();
            return true;
        }

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message: 'Sahayaq needs access to your location to find nearby services.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    const checkLocationPermissionOnLoad = async () => {
        try {
            const hasAsked = await AsyncStorage.getItem('hasAskedLocationPermission');
            if (!hasAsked) {
                // First time launching or after clearing data
                await AsyncStorage.setItem('hasAskedLocationPermission', 'true');
                const hasPermission = await requestPermission();
                if (hasPermission) {
                    await detectLocation();
                }
            } else {
                // If they already gave permission previously, silently fetch location
                if (Platform.OS === 'android') {
                    const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
                    if (granted) {
                        detectLocation();
                    }
                } else {
                    // On iOS we can just call it, it will silently fail if denied
                    detectLocation();
                }
            }
        } catch (error) {
            console.error('Error checking location permission flag:', error);
        }
    };

    const detectLocation = async (): Promise<{ lat: number, lng: number } | null> => {
        const hasPermission = await requestPermission();
        if (!hasPermission) return null;

        return new Promise((resolve) => {
            Geolocation.getCurrentPosition(
                async (position: any) => {
                    const { latitude, longitude } = position.coords;
                    // Reverse geocode in background
                    reverseGeocode(latitude, longitude);
                    resolve({ lat: latitude, lng: longitude });
                },
                (error: any) => {
                    console.warn('High accuracy location failed, trying low accuracy...', error.message);
                    Geolocation.getCurrentPosition(
                        async (lowAccuracyPos: any) => {
                            const { latitude, longitude } = lowAccuracyPos.coords;
                            reverseGeocode(latitude, longitude);
                            resolve({ lat: latitude, lng: longitude });
                        },
                        (lowAccuracyError: any) => {
                            console.error('All location attempts failed:', lowAccuracyError);
                            resolve(null);
                        },
                        { enableHighAccuracy: false, timeout: 10000, maximumAge: 10000 }
                    );
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
            );
        });
    };

    const reverseGeocode = async (lat: number, lon: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
                { headers: { 'User-Agent': 'Sahayaq-App' } }
            );
            const data = await response.json();
            let addressText = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

            if (data && data.display_name) {
                const address = data.address;
                const city = address.city || address.town || address.village || address.suburb || '';
                const road = address.road || '';
                const shortAddress = road ? `${road}, ${city}` : city;
                addressText = shortAddress || data.display_name;
            }

            await updateLocation(lat, lon, addressText);
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
            await updateLocation(lat, lon, `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
        }
    };

    const updateLocation = async (lat: number, lng: number, address?: string) => {
        try {
            const newLocation = {
                latitude: lat,
                longitude: lng,
                address: address || null,
            };
            setLocation(newLocation);
            await AsyncStorage.setItem('user_location', JSON.stringify(newLocation));
        } catch (error) {
            console.error('Failed to save location:', error);
        }
    };

    const clearLocation = async () => {
        try {
            setLocation({ latitude: null, longitude: null, address: null });
            await AsyncStorage.removeItem('user_location');
        } catch (error) {
            console.error('Failed to clear location:', error);
        }
    };

    return (
        <LocationContext.Provider value={{ location, isLoading, updateLocation, detectLocation, requestPermission, clearLocation, checkLocationPermissionOnLoad }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};
