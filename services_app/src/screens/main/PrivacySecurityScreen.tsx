import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Linking,
    Alert,
    ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PrivacySecurityScreen = ({ navigation }: any) => {
    const { logout } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = () => {
        Alert.alert(
            "Request Account Deletion",
            "Are you absolutely sure? Submitting this request will initiate the permanent deletion of your data profile and leads history. For security and compliance reasons, this process may take up to 45 working days.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Submit Deletion Request",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsDeleting(true);
                            await api.delete('/users/account');
                            Alert.alert('Request Submitted', 'Your account deletion request has been submitted and will be processed within 45 working days.', [
                                { text: 'OK' }
                            ]);
                            setIsDeleting(false);
                        } catch (error) {
                            console.error('Failed to request account deletion:', error);
                            setIsDeleting(false);
                            Alert.alert('Error', 'Failed to submit deletion request. Please try again or contact support.');
                        }
                    }
                }
            ]
        );
    };

    const Section = ({ title, content, icon }: { title: string; content: string; icon: string }) => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name={icon} size={22} color={COLORS.primary} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <Text style={styles.sectionContent}>{content}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={TYPOGRAPHY.h2}>Privacy & Security</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.introCard}>
                    <MaterialCommunityIcons name="shield-check" size={48} color={COLORS.primary} />
                    <Text style={styles.introTitle}>Provider Data Shield</Text>
                    <Text style={styles.introText}>
                        My Sahayaq is committed to transparency and compliance with India's Digital Personal Data Protection (DPDP) Act 2023 for our provider community.
                    </Text>
                </View>

                <Section
                    icon="gavel"
                    title="DPDP Act 2023 Compliance"
                    content="As a Service Provider, we process your identity, professional info, and location based on your explicit consent for business matching. You have the right to withdraw consent at any time, though this may impact your account visibility."
                />

                <Section
                    icon="account-key"
                    title="Your Data Principal Rights"
                    content="Under Indian DPDP Act, you have the right to: 1) Access a summary of your data. 2) Correct or update your professional credentials. 3) Request erasure of your data when your business relationship with My Sahayaq ends."
                />

                <Section
                    icon="lock-check"
                    title="Aadhaar & Identity Vault"
                    content="Your verification data (Aadhaar/OTP) is stored in a secure 'Identity Vault'. We only retain a UID Token and Masked Aadhaar. Raw identity documents are encrypted with HSM-grade access logs for compliance audits."
                />

                <Section
                    icon="account-search-outline"
                    title="Data Processor Obligations"
                    content="When you unlock a customer lead, you receive limited contact data. Under 2026 standards, you are a 'Data Processor' for this info. You must use it only for the requested service and delete it post-service completion."
                />

                <Section
                    icon="google-ads"
                    title="Ad-Gates & Third Parties"
                    content="To keep the platform free for providers, we use 'Ad-Gates' and third-party ad services. These services may use anonymous identifiers. We do not share your contact details or sensitive identity vault data with advertisers."
                />

                <Section
                    icon="alert-octagon-outline"
                    title="Liability Disclaimers"
                    content="My Sahayaq is a matchmaking platform. While we conduct basic verification, we are not responsible for off-platform disputes, quality of service, or data you share directly with customers outside our secure reveal system."
                />

                <Section
                    icon="database-minus"
                    title="Data & Consent Retention"
                    content="We retain your professional history and active consent records as long as your account exists. Consent for specific lead reveals is archived for 1 year to satisfy regulatory audit requirements."
                />

                <TouchableOpacity
                    style={styles.deleteAccountBtn}
                    onPress={handleDeleteAccount}
                    disabled={isDeleting}
                >
                    {isDeleting ? (
                        <ActivityIndicator color={COLORS.error} />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="delete-forever" size={20} color={COLORS.error} />
                            <Text style={styles.deleteAccountText}>Delete My Account</Text>
                        </>
                    )}
                </TouchableOpacity>

                <Text style={styles.deletionDisclaimer}>
                    We will take up to 45 working days to delete your data from our database for security reasons.
                </Text>

                <TouchableOpacity
                    style={styles.fullPolicyBtn}
                    onPress={() => Linking.openURL('https://mysahayaq.in/privacy')}
                >
                    <Text style={styles.fullPolicyText}>Read Full Privacy Policy</Text>
                    <MaterialCommunityIcons name="open-in-new" size={16} color={COLORS.primary} />
                </TouchableOpacity>

                <Text style={styles.footerNote}>Last Updated: February 2026 "¢ DPDP Compliant</Text>
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
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        marginRight: SPACING.md,
    },
    scrollContent: {
        padding: SPACING.lg,
        paddingBottom: 40,
    },
    introCard: {
        backgroundColor: COLORS.white,
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.small,
    },
    introTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.text,
        marginTop: 12,
        marginBottom: 8,
    },
    introText: {
        ...TYPOGRAPHY.bodySecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    section: {
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.small,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionIcon: {
        marginRight: 12,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h3,
        fontSize: 16,
    },
    sectionContent: {
        ...TYPOGRAPHY.bodySecondary,
        lineHeight: 22,
    },
    fullPolicyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        paddingVertical: 12,
        gap: 8,
    },
    fullPolicyText: {
        ...TYPOGRAPHY.body,
        fontWeight: '700',
        color: COLORS.primary,
    },
    deleteAccountBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.xl,
        paddingVertical: 14,
        paddingHorizontal: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.error,
        borderRadius: 12,
        backgroundColor: '#FEF2F2',
        gap: 8,
        ...SHADOWS.small,
        marginBottom: SPACING.md,
    },
    deleteAccountText: {
        ...TYPOGRAPHY.body,
        fontWeight: '700',
        color: COLORS.error,
    },
    deletionDisclaimer: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        textAlign: 'center',
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        fontStyle: 'italic',
    },
    footerNote: {
        textAlign: 'center',
        ...TYPOGRAPHY.caption,
        marginTop: 20,
    },
});

export default PrivacySecurityScreen;
