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

const PrivacyPolicyScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    const Section = ({ title, content }: { title: string; content: string }) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionText}>{content}</Text>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#2D3436" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>Your privacy is important to us. This policy explains how Sahayaq collects, uses, and protects your personal data in compliance with India's DPDP Act 2023.</Text>
                </View>

                <Section
                    title="1. Data We Collect"
                    content="We collect your name, phone number, and precise location to provide local service matches. We also store service request details and communication history with providers."
                />

                <Section
                    title="2. Purpose of Collection"
                    content="Your data is used to: (a) Match you with nearby verified providers; (b) Send service status updates; (c) Ensure platform security and fraud prevention."
                />

                <Section
                    title="3. Data Sharing"
                    content="To fulfill your service request, your contact details (phone number) are shared with a maximum of 3 service providers only after your explicit consent or intent shown on the ad-gate."
                />

                <Section
                    title="4. Your Rights"
                    content="Under the Digital Personal Data Protection Act 2023, you have the right to access, correct, or request the deletion of your personal data at any time."
                />

                <Section
                    title="5. Security"
                    content="We implement industry-standard encryption and access controls to protect your data. Identity-sensitive information is stored in an isolated data vault."
                />

                <Section
                    title="6. Cookies & Tracking"
                    content="We use anonymous identifiers for app functionality and to show relevant advertisements through third-party services like Google AdMob."
                />

                <View style={styles.footer}>
                    <Text style={styles.lastUpdated}>Version 1.0 • Last Updated January 2026</Text>
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
        backgroundColor: '#F0F3FF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    infoText: { fontSize: 14, color: '#3949AB', lineHeight: 22, fontWeight: '600' },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 17, fontWeight: '800', color: '#2D3436', marginBottom: 8 },
    sectionText: { fontSize: 14, color: '#636E72', lineHeight: 22 },
    footer: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#F1F2F6', paddingTop: 20 },
    lastUpdated: { fontSize: 12, color: '#B2BEC3', textAlign: 'center', fontWeight: '700' },
});

export default PrivacyPolicyScreen;
