import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';

const AboutOferaScreen = ({ navigation }: any) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={TYPOGRAPHY.h2}>About Spot Loot Services</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.heroSection}>
                    <Image
                        source={require('../../assets/Untitled design.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.appName}>www.mysahayaq.in</Text>
                    <Text style={styles.appTagline}>Empowering Professionals, Simplifying Lives.</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Our Mission</Text>
                    <Text style={styles.bodyText}>
                        My Sahayaq is built with the vision of creating a seamless bridge between high-quality service providers and customers who value talent, reliability, and speed. We believe in empowering local professionals by giving them the digital tools they need to grow their business.
                    </Text>
                </View>

                <View style={styles.featuresSection}>
                    <Text style={styles.sectionTitle}>Why Choose My Sahayaq?</Text>

                    <View style={styles.featureItem}>
                        <View style={styles.featureIconBox}>
                            <Icon name="trending-up" size={20} color={COLORS.primary} />
                        </View>
                        <View style={styles.featureTextContent}>
                            <Text style={styles.featureTitle}>Business Growth</Text>
                            <Text style={styles.featureDescription}>Access a massive pool of local customers looking for your expertise.</Text>
                        </View>
                    </View>

                    <View style={styles.featureItem}>
                        <View style={styles.featureIconBox}>
                            <Icon name="shield-check" size={20} color={COLORS.secondary} />
                        </View>
                        <View style={styles.featureTextContent}>
                            <Text style={styles.featureTitle}>Verified Trust</Text>
                            <Text style={styles.featureDescription}>Build immediate trust with customers through our professional verification system.</Text>
                        </View>
                    </View>

                    <View style={styles.featureItem}>
                        <View style={styles.featureIconBox}>
                            <Icon name="tool" size={20} color={COLORS.accent} />
                        </View>
                        <View style={styles.featureTextContent}>
                            <Text style={styles.featureTitle}>Powerful Tools</Text>
                            <Text style={styles.featureDescription}>Manage your services, track analytics, and handle payments all in one place.</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.madeInTitle}>Crafted with â¤ï¸ in Andhra Pradesh</Text>
                    <Text style={styles.footerInfo}>© 2026 Ride Andhra.</Text>
                    <Text style={styles.footerInfo}>Join the revolution of services .</Text>
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
    heroSection: {
        alignItems: 'center',
        paddingVertical: SPACING.xxl,
    },
    logoImage: {
        width: 120,
        height: 120,

    },
    appName: {
        ...TYPOGRAPHY.h1,
        textDecorationLine: 'underline',
        color: COLORS.text,
        letterSpacing: 1,

    },
    appTagline: {
        ...TYPOGRAPHY.bodySecondary,
        color: COLORS.primary,
        fontWeight: '600',
        marginTop: SPACING.xs,
    },
    section: {
        marginBottom: SPACING.xxl,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    bodyText: {
        ...TYPOGRAPHY.bodySecondary,
        lineHeight: 24,
    },
    featuresSection: {
        marginBottom: SPACING.xxl,
    },
    featureItem: {
        flexDirection: 'row',
        marginBottom: SPACING.lg,
    },
    featureIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
        ...SHADOWS.small,
    },
    featureTextContent: {
        flex: 1,
    },
    featureTitle: {
        ...TYPOGRAPHY.body,
        fontWeight: '700',
        color: COLORS.text,
    },
    featureDescription: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    footer: {
        alignItems: 'center',
        marginTop: SPACING.xl,
        paddingBottom: SPACING.xxl,
    },
    madeInTitle: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    footerInfo: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        opacity: 0.6,
        marginBottom: 2,
    },
});

export default AboutOferaScreen;
