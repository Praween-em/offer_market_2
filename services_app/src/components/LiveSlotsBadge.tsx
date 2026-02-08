import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface LiveSlotsBadgeProps {
    unlockCount: number;
    maxUnlocks?: number;
}

/**
 * Live Slots Badge - Real-time Scarcity Indicator
 * 2026 DPDP Compliance: Shows [n/3 spots filled]
 */
const LiveSlotsBadge: React.FC<LiveSlotsBadgeProps> = ({
    unlockCount,
    maxUnlocks = 3,
}) => {
    const slotsRemaining = maxUnlocks - unlockCount;

    // Color coding based on availability
    const getColor = () => {
        if (unlockCount === 0) return '#4CAF50'; // Green: All slots available
        if (unlockCount === 1) return '#4CAF50'; // Green: 2 slots remaining
        if (unlockCount === 2) return '#FF9800'; // Yellow: 1 slot remaining
        return '#F44336'; // Red: No slots
    };

    const getIcon = () => {
        if (unlockCount >= maxUnlocks) return 'lock';
        if (unlockCount === maxUnlocks - 1) return 'alert';
        return 'check-circle';
    };

    const color = getColor();

    return (
        <View style={[styles.container, { backgroundColor: `${color}15`, borderColor: color }]}>
            <MaterialCommunityIcons name={getIcon()} size={14} color={color} />
            <Text style={[styles.text, { color }]}>
                {unlockCount >= maxUnlocks
                    ? 'Filled'
                    : `${slotsRemaining}/${maxUnlocks} spots left`}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    text: {
        fontSize: 11,
        fontWeight: '700',
    },
});

export default LiveSlotsBadge;
