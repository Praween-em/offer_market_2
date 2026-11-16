import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../context/LanguageContext';

const PrivacySecurityScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { t } = useLanguage();

    const Section = ({ title, content, icon }: { title: string; content: string; icon: string }) => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name={icon} size={22} color="#FF4757" style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <Text style={styles.sectionContent}>{content}</Text>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#2D3436" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy & Security</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.introCard}>
                    <MaterialCommunityIcons name="shield-check" size={48} color="#FF4757" />
                    <Text style={styles.introTitle}>Your Data, Protected</Text>
                    <Text style={styles.introText}>
                        My Sahayaq is committed to transparency and compliance with India's Digital Personal Data Protection (DPDP) Act 2023.
                    </Text>
                </View>

                <Section
                    icon="gavel"
                    title="DPDP Act 2023 Compliance"
                    content="We process your personal data (name, phone number, location) based on your explicit consent. This data is used solely for connecting you with service providers and improving your experience. You have the right to withdraw consent at any time through app settings."
                />

                <Section
                    icon="account-key"
                    title="Your Data Rights"
                    content="Under Indian law, you have the right to: 1) Access a summary of your data being processed. 2) Correct or complete your data. 3) Request erasure of your personal data when it is no longer necessary for the purpose it was collected."
                />

                <Section
                    icon="lock-outline"
                    title="Data Security & Storage"
                    content="Your data is stored in secured, encrypted databases. Identity-sensitive information is stored in an isolated 'Data Vault' with HSM-grade access logs. We conduct regular security audits to ensure your information remains safe from unauthorized access."
                />

                <Section
                    icon="google-ads"
                    title="Ad Services & Third Parties"
                    content="My Sahayaq uses third-party advertising services (including Google Ad Services) to keep the platform free for users. These services may collect anonymous identifiers to show relevant ads. We do not share your direct contact details with advertisers."
                />

                <Section
                    icon="alert-octagon-outline"
                    title="Liability Disclaimers"
                    content="While we verify service providers, My Sahayaq is a facilitator platform. We are not responsible for off-platform interactions, quality of service provided by third-party workers, or data shared by you directly with a provider outside the app's secure reveal system."
                />

                <Section
                    icon="database-minus"
                    title="Data Retention"
                    content="We retain your data only as long as your account is active or as required by law (e.g., for financial or legal audits). Consent records for contact reveals are stored for a period of 1 year as per standard compliance protocols."
                />

                <TouchableOpacity
                    style={styles.fullPolicyBtn}
                    onPress={() => Linking.openURL('https://mysahayaq.in/privacy')}
                >
                    <Text style={styles.fullPolicyText}>Read Full Privacy Policy</Text>
                    <MaterialCommunityIcons name="open-in-new" size={16} color="#FF4757" />
                </TouchableOpacity>

                <Text style={styles.footerNote}>Last Updated: February 2026</Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFF',
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
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    introCard: {
        backgroundColor: '#FFF',
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F1F2F6',
        elevation: 2,
    },
    introTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#2D3436',
        marginTop: 12,
        marginBottom: 8,
    },
    introText: {
        fontSize: 14,
        color: '#636E72',
        textAlign: 'center',
        lineHeight: 20,
    },
    section: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F2F6',
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
        fontSize: 16,
        fontWeight: '800',
        color: '#2D3436',
    },
    sectionContent: {
        fontSize: 14,
        color: '#636E72',
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
        fontSize: 15,
        fontWeight: '700',
        color: '#FF4757',
    },
    footerNote: {
        textAlign: 'center',
        fontSize: 12,
        color: '#B2BEC3',
        marginTop: 20,
    },
});

export default PrivacySecurityScreen;
