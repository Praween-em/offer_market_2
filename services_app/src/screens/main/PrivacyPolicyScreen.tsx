import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';

const PrivacyPolicyScreen = ({ navigation }: any) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={TYPOGRAPHY.h2}>Privacy Policy</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Introduction</Text>
                    <Text style={styles.bodyText}>
                        My Sahayaq ("we", "us", or "our") is committed to protecting the privacy of our Service Providers. This policy outlines how we handle your personal data in compliance with the Digital Personal Data Protection (DPDP) Act 2023 and other applicable laws as of 2026.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Data We Collect</Text>
                    <Text style={[styles.bodyText, { marginBottom: SPACING.sm }]}>
                        To facilitate the My Sahayaq ecosystem, we collect:
                    </Text>
                    <View style={styles.bulletItem}>
                        <Icon name="check" size={16} color={COLORS.secondary} />
                        <Text style={styles.bulletText}>Identity Data: Name, Photo, and Verified Identity markers (Masked Aadhaar, UID Token).</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <Icon name="check" size={16} color={COLORS.secondary} />
                        <Text style={styles.bulletText}>Contact Data: Phone number and optional email for account management.</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <Icon name="check" size={16} color={COLORS.secondary} />
                        <Text style={styles.bulletText}>Professional Data: Service categories, experience, and bio.</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. Aadhaar & Identity Vault</Text>
                    <Text style={styles.bodyText}>
                        For verified providers, we implement an "Aadhaar Identity Vault". We do not store your full Aadhaar number. Instead, we store a mathematically generated 'UID Token' and a 'Masked Aadhaar'. Your raw XML data is stored in an encrypted vault accessible only for statutory compliance and audit purposes.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. Lead Data Sharing</Text>
                    <Text style={styles.bodyText}>
                        When you 'Unlock' a customer lead, you receive access to that customer's contact details. Under 2026 data standards, you act as a 'Data Processor' for this information. You agree to use this data ONLY for the purpose of fulfilling the service request and must not store or share this data beyond the session requirement.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5. Your Rights</Text>
                    <Text style={styles.bodyText}>
                        As a Data Principal, you have the right to request access, correction, or erasure of your personal data. You may also withdraw consent for verification at any time, which may lead to the suspension of your 'Verified' status.
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2026 Ride Andhra Tech Solutions. DPDP Compliant.</Text>
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

export default PrivacyPolicyScreen;
