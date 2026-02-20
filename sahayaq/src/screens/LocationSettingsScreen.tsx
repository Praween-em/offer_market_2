import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    TextInput,
    ActivityIndicator,
    PermissionsAndroid,
    Platform,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';

const LocationSettingsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const { location, updateLocation, detectLocation, isLoading: isGlobalLoading } = useLocation();
    const [localLoading, setLocalLoading] = useState(false);
    const isLoading = isGlobalLoading || localLoading;

    // Initialize search query with current context address if available
    useEffect(() => {
        if (location.address) {
            setSearchQuery(location.address);
        }
    }, [location.address]);


    const handleUseCurrentLocation = async () => {
        setLocalLoading(true);
        try {
            const coords = await detectLocation();
            if (!coords) {
                Alert.alert(
                    'Location Error',
                    'Failed to get your current location. Please ensure GPS is enabled or try entering your location manually.'
                );
            }
            // detectLocation already calls reverseGeocode and updateLocation in the background
            setLocalLoading(false);
        } catch (error) {
            setLocalLoading(false);
            console.error('Location error:', error);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#2D3436" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('locationSettings')}</Text>
            </View>

            <View style={styles.content}>
                <TouchableOpacity
                    style={styles.currentLocationBtn}
                    onPress={handleUseCurrentLocation}
                    disabled={isLoading}
                >
                    <View style={styles.currentLocationLeft}>
                        <View style={styles.locationIconBg}>
                            <MaterialCommunityIcons name="crosshairs-gps" size={22} color="#4CAF50" />
                        </View>
                        <View>
                            <Text style={styles.btnTitle}>{t('useCurrentLocation')}</Text>
                            <Text style={styles.btnSubtitle}>{t('currentLocation')}</Text>
                        </View>
                    </View>
                    {isLoading ? (
                        <ActivityIndicator color="#4CAF50" />
                    ) : (
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#B2BEC3" />
                    )}
                </TouchableOpacity>

                <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.dividerText}>{t('enterLocation')}</Text>
                    <View style={styles.line} />
                </View>

                <View style={styles.searchContainer}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#B2BEC3" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('locationSearchPlaceholder')}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#B2BEC3"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <MaterialCommunityIcons name="close-circle" size={18} color="#B2BEC3" />
                        </TouchableOpacity>
                    )}
                </View>

                {searchQuery.length > 0 && !isLoading && (
                    <View style={styles.recentContainer}>
                        <TouchableOpacity style={styles.locationItem} onPress={() => navigation.goBack()}>
                            <MaterialCommunityIcons name="map-marker-outline" size={20} color="#636E72" />
                            <Text style={styles.locationItemText}>{searchQuery}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.saveBtnText}>{t('save')}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F2F6',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#2D3436',
    },
    content: {
        padding: 20,
    },
    currentLocationBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#4CAF5010',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#4CAF5030',
        marginBottom: 24,
    },
    currentLocationLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    locationIconBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    btnTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2D3436',
    },
    btnSubtitle: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '600',
        marginTop: 2,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#F1F2F6',
    },
    dividerText: {
        marginHorizontal: 12,
        fontSize: 12,
        fontWeight: '600',
        color: '#B2BEC3',
        textTransform: 'uppercase',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 16,
        borderRadius: 12,
        height: 52,
        borderWidth: 1,
        borderColor: '#F1F2F6',
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#2D3436',
        fontWeight: '500',
        paddingVertical: 0,
    },
    recentContainer: {
        marginTop: 16,
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F2F6',
    },
    locationItemText: {
        fontSize: 15,
        color: '#2D3436',
    },
    saveBtn: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: '#FF4757',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF4757',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveBtnText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFF',
    },
});

export default LocationSettingsScreen;
