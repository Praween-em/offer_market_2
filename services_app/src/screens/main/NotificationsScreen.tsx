import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';

const NotificationsScreen = ({ navigation }: any) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={TYPOGRAPHY.h2}>Notifications</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={TYPOGRAPHY.bodySecondary}>Your notifications will appear here.</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        marginRight: SPACING.md,
    },
    content: {
        padding: SPACING.lg,
    },
});

export default NotificationsScreen;
