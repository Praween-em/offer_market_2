import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';

const HelpCenterScreen = ({ navigation }: any) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={TYPOGRAPHY.h2}>Help Center</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

                    <View style={styles.faqItem}>
                        <Text style={styles.question}>How does My Sahayaq work?</Text>
                        <Text style={styles.answer}>My Sahayaq is an informational platform. Users post service requests, and Service Providers can browse and contact them by unlocking leads.</Text>
                    </View>

                    <View style={styles.faqItem}>
                        <Text style={styles.question}>What is a Verified Provider?</Text>
                        <Text style={styles.answer}>Verified providers have completed Aadhaar-based e-KYC. This confirms their identity but does not guarantee service quality.</Text>
                    </View>

                    <View style={styles.faqItem}>
                        <Text style={styles.question}>How do I unlock a lead?</Text>
                        <Text style={styles.answer}>You can unlock user contact details from the Service Feed or Request Details screen. This may require professional verification.</Text>
                    </View>

                    <View style={styles.faqItem}>
                        <Text style={styles.question}>What are my legal responsibilities?</Text>
                        <Text style={styles.answer}>As a provider, you are responsible for the quality of your work and the safety of your interactions. Please refer to our Terms of Service for full details.</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Still need help? Visit our Contact Support page.</Text>
                </View>
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
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    faqItem: {
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: 12,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    question: {
        ...TYPOGRAPHY.body,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    answer: {
        ...TYPOGRAPHY.bodySecondary,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    footer: {
        marginTop: SPACING.xl,
        alignItems: 'center',
    },
    footerText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
});

export default HelpCenterScreen;
