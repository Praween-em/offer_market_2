import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const AboutAppScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    const FeatureItem = ({ icon, title, text }: any) => (
        <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
                <MaterialCommunityIcons name={icon} size={24} color="#FF4757" />
            </View>
            <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureText}>{text}</Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#2D3436" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About Sahayaq</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.logoCard}>
                    <View style={styles.logoPlaceholder}>
                        <MaterialCommunityIcons name="hand-heart" size={60} color="#FF4757" />
                    </View>
                    <Text style={styles.appName}>Sahayaq</Text>
                    <Text style={styles.appTagline}>Connecting Services, Empowring People</Text>
                    <View style={styles.versionBadge}>
                        <Text style={styles.versionText}>Version 1.0.0 (Production)</Text>
                    </View>
                </View>

                <View style={styles.contentCard}>
                    <Text style={styles.cardTitle}>Our Mission</Text>
                    <Text style={styles.cardText}>
                        Sahayaq is built with a vision to organize India's fragmented service sector. We aim to provide every consumer with easy access to verified professionals, while helping service providers grow their businesses through technology.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Why Sahayaq?</Text>
                    <FeatureItem
                        icon="shield-check-outline"
                        title="Verified Professionals"
                        text="All Verified Professionals are verified with Aadhaar Offline XML."
                    />
                    <FeatureItem
                        icon="timer-outline"
                        title="Instant Connections"
                        text="Post your requirement and get responses from nearby experts in minutes."
                    />
                    <FeatureItem
                        icon="currency-inr"
                        title="Fair Pricing"
                        text="No hidden charges. Negotiate directly with providers and pay for value."
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.madeIn}>Made with ❤️ in India</Text>
                    <Text style={styles.copyright}>© 2025 Ride Andhra Tech Solutions</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
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
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#2D3436' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    logoCard: {
        backgroundColor: '#FFF',
        padding: 30,
        borderRadius: 24,
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F1F2F6',
        elevation: 2,
    },
    logoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 24,
        backgroundColor: '#FF475710',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    appName: { fontSize: 26, fontWeight: '900', color: '#2D3436' },
    appTagline: { fontSize: 14, color: '#636E72', marginTop: 4 },
    versionBadge: {
        backgroundColor: '#F1F2F6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 16,
    },
    versionText: { fontSize: 12, color: '#B2BEC3', fontWeight: '700' },
    contentCard: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F1F2F6',
    },
    cardTitle: { fontSize: 18, fontWeight: '800', color: '#2D3436', marginBottom: 12 },
    cardText: { fontSize: 14, color: '#636E72', lineHeight: 22 },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2D3436', marginBottom: 16, paddingHorizontal: 4 },
    featureItem: { flexDirection: 'row', marginBottom: 20 },
    featureIconContainer: { marginRight: 16, marginTop: 2 },
    featureContent: { flex: 1 },
    featureTitle: { fontSize: 16, fontWeight: '700', color: '#2D3436', marginBottom: 4 },
    featureText: { fontSize: 14, color: '#636E72', lineHeight: 20 },
    footer: { alignItems: 'center', marginTop: 10 },
    madeIn: { fontSize: 14, fontWeight: '600', color: '#2D3436', marginBottom: 4 },
    copyright: { fontSize: 12, color: '#B2BEC3' },
});

export default AboutAppScreen;
