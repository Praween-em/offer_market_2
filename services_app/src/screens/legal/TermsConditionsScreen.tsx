import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/theme';

const TermsConditionsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    const TermSection = ({ title, points }: { title: string; points: string[] }) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {points.map((text, index) => (
                <View key={index} style={styles.pointRow}>
                    <View style={styles.bullet} />
                    <Text style={styles.pointText}>{text}</Text>
                </View>
            ))}
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#2D3436" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms & Conditions</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>By using the Sahayaq app, you agree to these terms. Please read them carefully to understand your rights and responsibilities.</Text>
                </View>

                <TermSection
                    title="1. User Eligibility"
                    points={[
                        "You must be at least 18 years old to use this service.",
                        "You must provide accurate and complete registration information.",
                        "One user is allowed to have only one active account."
                    ]}
                />

                <TermSection
                    title="2. Service Requests"
                    points={[
                        "Sahayaq acts as a marketplace to connect customers with providers.",
                        "We do not guarantee the completion of any request posted on the platform.",
                        "Users are responsible for verifying the provider's work before making payments off-platform."
                    ]}
                />

                <TermSection
                    title="3. Platform Fees & Payments"
                    points={[
                        "Sahayaq may charge a small fee for certain premium features.",
                        "Payments for services are settled directly between the customer and the provider.",
                        "Sahayaq is not responsible for refund disputes regarding service quality."
                    ]}
                />

                <TermSection
                    title="4. Prohibited Activities"
                    points={[
                        "Harassment or abuse of service providers is strictly prohibited.",
                        "Sharing fraudulent requests or misleading information will lead to account suspension.",
                        "Circumventing platform protocols for personal gain is a violation of terms."
                    ]}
                />

                <TermSection
                    title="5. Data Privacy (DPDP)"
                    points={[
                        "Your data is processed as per our Privacy Policy and India's DPDP Act 2023.",
                        "You consent to sharing your contact with up to 3 providers for lead fulfillment.",
                        "Consent records are kept for audit purposes for a period of up to 1 year."
                    ]}
                />

                <TermSection
                    title="6. Termination"
                    points={[
                        "We reserve the right to terminate accounts that violate community guidelines.",
                        "Users can request account deletion at any time through the support section."
                    ]}
                />

                <View style={styles.footer}>
                    <Text style={styles.lastUpdated}>Version 1.2 • Last Updated February 07, 2026</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F2F6',
    },
    backButton: { marginRight: 16 },
    headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: '#2D3436' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    infoBox: {
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    infoText: { fontSize: 14, color: '#636E72', lineHeight: 22, fontWeight: '600' },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 17, fontWeight: '800', color: '#2D3436', marginBottom: 12 },
    pointRow: { flexDirection: 'row', marginBottom: 8, paddingRight: 10 },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primary || '#4F46E5',
        marginTop: 8,
        marginRight: 12,
    },
    pointText: { fontSize: 14, color: '#636E72', lineHeight: 22 },
    footer: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#F1F2F6', paddingTop: 20 },
    lastUpdated: { fontSize: 12, color: '#B2BEC3', textAlign: 'center', fontWeight: '700' },
});

export default TermsConditionsScreen;
