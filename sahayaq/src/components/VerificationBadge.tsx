import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface VerificationBadgeProps {
    isVerified: boolean;
    size?: 'small' | 'large';
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ isVerified, size = 'small' }) => {
    const isSmall = size === 'small';

    return (
        <View style={[
            styles.badge,
            isVerified ? styles.verifiedBadge : styles.unverifiedBadge,
            isSmall ? styles.smallBadge : styles.largeBadge
        ]}>
            <MaterialCommunityIcons
                name={isVerified ? "check-decagram" : "alert-circle-outline"}
                size={isSmall ? 12 : 16}
                color={isVerified ? "#1E90FF" : "#FF4757"}
            />
            <Text style={[
                styles.badgeText,
                isVerified ? styles.verifiedText : styles.unverifiedText,
                isSmall ? styles.smallText : styles.largeText
            ]}>
                {isVerified ? "Verified" : "Unverified"}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 3,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    verifiedBadge: {
        backgroundColor: '#FFF',
        borderColor: '#1E90FF',
    },
    unverifiedBadge: {
        backgroundColor: '#FFF',
        borderColor: '#FF4757',
    },
    smallBadge: {
        paddingHorizontal: 4,
        paddingVertical: 1,
    },
    largeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    badgeText: {
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    verifiedText: {
        color: '#1E90FF',
    },
    unverifiedText: {
        color: '#FF4757',
    },
    smallText: {
        fontSize: 9,
    },
    largeText: {
        fontSize: 11,
        letterSpacing: 0.5,
    },
});

export default VerificationBadge;
