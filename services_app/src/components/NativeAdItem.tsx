import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import {
    NativeAd,
    NativeAdView,
    NativeMediaView,
    NativeAsset,
    NativeAssetType,
    TestIds,
} from 'react-native-google-mobile-ads';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../theme/theme';
import Icon from 'react-native-vector-icons/Feather';

// WARNING: Using production Ad Unit IDs during development can lead to account suspension.
const NATIVE_AD_UNIT_ID = 'ca-app-pub-5362340568713961/6437577804';

const NativeAdItem = () => {
    const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let ad: NativeAd | null = null;
        let isMounted = true;

        const loadAd = async () => {
            try {
                ad = await NativeAd.createForAdRequest(NATIVE_AD_UNIT_ID);
                if (isMounted) {
                    setNativeAd(ad);
                    setLoading(false);
                }
            } catch (err) {
                console.warn('Failed to load native ad:', err);
                if (isMounted) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        loadAd();

        return () => {
            isMounted = false;
            if (ad) {
                ad.destroy();
            }
        };
    }, []);

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator color={COLORS.primary} size="small" />
                <Text style={styles.loadingText}>Loading promotion...</Text>
            </View>
        );
    }

    if (error || !nativeAd) {
        return null;
    }

    return (
        <NativeAdView nativeAd={nativeAd} style={styles.container}>
            <View style={styles.adHeader}>
                <View style={styles.sponsoredBadge}>
                    <Text style={styles.sponsoredText}>SPONSORED</Text>
                </View>
                <NativeAsset assetType={NativeAssetType.HEADLINE}>
                    <Text style={styles.headline} numberOfLines={1}>{nativeAd.headline}</Text>
                </NativeAsset>
            </View>

            <View style={styles.adBody}>
                {nativeAd.icon && (
                    <View style={styles.iconContainer}>
                        <NativeAsset assetType={NativeAssetType.ICON}>
                            <Image source={{ uri: nativeAd.icon.url }} style={styles.adIcon} />
                        </NativeAsset>
                    </View>
                )}
                <View style={styles.textContainer}>
                    <NativeAsset assetType={NativeAssetType.BODY}>
                        <Text style={styles.bodyText} numberOfLines={2}>{nativeAd.body}</Text>
                    </NativeAsset>
                    {nativeAd.advertiser && (
                        <NativeAsset assetType={NativeAssetType.ADVERTISER}>
                            <Text style={styles.advertiserText}>{nativeAd.advertiser}</Text>
                        </NativeAsset>
                    )}
                </View>
            </View>

            <NativeMediaView style={styles.mediaView} />

            <View style={styles.footer}>
                <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
                    <View style={styles.ctaButton}>
                        <Text style={styles.ctaText}>{nativeAd.callToAction || 'Learn More'}</Text>
                        <Icon name="arrow-right" size={16} color={COLORS.white} />
                    </View>
                </NativeAsset>
            </View>
        </NativeAdView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 150,
    },
    loadingText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        marginTop: SPACING.sm,
    },
    adHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        gap: SPACING.sm,
    },
    sponsoredBadge: {
        backgroundColor: `${COLORS.secondary}15`,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: `${COLORS.secondary}30`,
    },
    sponsoredText: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.secondary,
        letterSpacing: 0.5,
    },
    headline: {
        ...TYPOGRAPHY.h3,
        fontSize: 16,
        color: COLORS.text,
        flex: 1,
    },
    adBody: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: SPACING.md,
    },
    adIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
    },
    textContainer: {
        flex: 1,
    },
    bodyText: {
        ...TYPOGRAPHY.bodySecondary,
        fontSize: 14,
        lineHeight: 18,
    },
    advertiserText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        marginTop: 2,
        fontWeight: '600',
    },
    mediaView: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        backgroundColor: COLORS.background,
        marginBottom: SPACING.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    ctaButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
        ...SHADOWS.small,
    },
    ctaText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 14,
    },
});

export default NativeAdItem;
