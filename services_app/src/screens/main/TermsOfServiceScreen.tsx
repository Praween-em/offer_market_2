import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';

const TermsOfServiceScreen = ({ navigation }: any) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={TYPOGRAPHY.h2}>Terms of Service</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Sahayaq as an Informational Intermediary</Text>
                    <Text style={styles.bodyText}>
                        Sahayaq is a marketplace intermediary that connects Service Providers with Users ("Service Seekers"). You acknowledge that Sahayaq does not provide services directly, is not an employer, and does not act as an agent for any Service Provider. We act strictly as a venue for informational exchange.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Provider Categories & Verification</Text>
                    <Text style={styles.bodyText}>
                        Service Providers may be "Verified" or "Unverified".
                    </Text>
                    <View style={styles.bulletItem}>
                        <Icon name="shield-check" size={16} color={COLORS.secondary} />
                        <Text style={styles.bulletText}>Verified: Identity markers checked via Aadhaar/OKYC. This does not constitute a guarantee of service quality or character.</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <Icon name="x-circle" size={16} color={COLORS.error} />
                        <Text style={styles.bulletText}>Unverified: Use at significantly higher risk. These profiles have not undergone identity checks.</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. Lead Unlocking & Data Usage</Text>
                    <Text style={styles.bodyText}>
                        Unlocking a lead gives you access to a customer's personal data. In compliance with 2026 Data Protection laws, you agree to:
                    </Text>
                    <View style={styles.bulletItem}>
                        <Icon name="lock" size={16} color={COLORS.primary} />
                        <Text style={styles.bulletText}>Maintain strict confidentiality of User contact details.</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <Icon name="trash-2" size={16} color={COLORS.primary} />
                        <Text style={styles.bulletText}>Delete User data immediately if a contract is not established.</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. Limitation of Liability & Risks</Text>
                    <Text style={[styles.bodyText, { fontWeight: '700', color: COLORS.error }]}>
                        Disclaimer of Physical & Financial Risks:
                    </Text>
                    <Text style={styles.bodyText}>
                        Sahayaq assumes ZERO liability for:
                    </Text>
                    <View style={styles.bulletItem}>
                        <Icon name="alert-triangle" size={16} color={COLORS.error} />
                        <Text style={styles.bulletText}>Physical safety or property damage during service provision.</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <Icon name="alert-triangle" size={16} color={COLORS.error} />
                        <Text style={styles.bulletText}>Non-payment or financial disputes between Providers and Users.</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <Icon name="alert-triangle" size={16} color={COLORS.error} />
                        <Text style={styles.bulletText}>Accuracy of service requests or the character of any User.</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5. Compliance with 2026 Laws</Text>
                    <Text style={styles.bodyText}>
                        You agree to comply with all applicable laws, including Tax regulations, Consumer Protection (E-Commerce) Rules 2026, and the DPDP Act 2023. Unauthorized data harvesting or harassment of Users will lead to immediate permanent ban and legal reporting.
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Questions? Contact us at legal@ofera.com</Text>
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
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        ...SHADOWS.small,
    },
    backButton: {
        marginRight: SPACING.md,
    },
    content: {
        padding: SPACING.lg,
    },
    introCard: {
        backgroundColor: `${COLORS.primary}08`,
        borderRadius: 16,
        padding: SPACING.xl,
        alignItems: 'center',
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: `${COLORS.primary}20`,
    },
    introIcon: {
        marginBottom: SPACING.md,
    },
    lastUpdated: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    introText: {
        ...TYPOGRAPHY.body,
        textAlign: 'center',
        color: COLORS.text,
        fontWeight: '500',
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    bodyText: {
        ...TYPOGRAPHY.bodySecondary,
        lineHeight: 22,
    },
    bulletItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.sm,
        paddingLeft: SPACING.sm,
    },
    bulletText: {
        ...TYPOGRAPHY.bodySecondary,
        marginLeft: SPACING.sm,
        flex: 1,
    },
    footer: {
        marginTop: SPACING.xxl,
        paddingBottom: SPACING.xxl,
        alignItems: 'center',
    },
    footerText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
});

export default TermsOfServiceScreen;
