import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';

const ContactSupportScreen = ({ navigation }: any) => {
    const handleEmail = () => Linking.openURL('mailto:mysahayaq@gmail.com');
    const handleCall = () => Linking.openURL('tel:+919876543210');
    const handleWhatsApp = () => Linking.openURL('whatsapp://send?phone=+919876543210');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={TYPOGRAPHY.h2}>Contact & Support</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.heroSection}>
                    <Icon name="headphones" size={48} color={COLORS.primary} />
                    <Text style={styles.heroTitle}>How can we help you?</Text>
                    <Text style={styles.heroSubtext}>
                        Our My Sahayaq support team is available 24/7 to assist you with any questions or issues.
                    </Text>
                </View>

                <View style={styles.contactContainer}>
                    <TouchableOpacity style={styles.contactCard} onPress={handleWhatsApp}>
                        <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                            <Icon name="message-circle" size={24} color="#166534" />
                        </View>
                        <View style={styles.cardTextContent}>
                            <Text style={styles.cardTitle}>WhatsApp Chat</Text>
                            <Text style={styles.cardSubtext}>Click to chat with an expert</Text>
                        </View>
                        <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactCard} onPress={handleCall}>
                        <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
                            <Icon name="phone" size={24} color="#1E40AF" />
                        </View>
                        <View style={styles.cardTextContent}>
                            <Text style={styles.cardTitle}>Phone Support</Text>
                            <Text style={styles.cardSubtext}>+91 98765 43210</Text>
                        </View>
                        <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
                        <View style={[styles.iconBox, { backgroundColor: '#F3F4F6' }]}>
                            <Icon name="mail" size={24} color={COLORS.textSecondary} />
                        </View>
                        <View style={styles.cardTextContent}>
                            <Text style={styles.cardTitle}>Email Support</Text>
                            <Text style={styles.cardSubtext}>mysahayaq@gmail.com</Text>
                        </View>
                        <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.faqSection}>
                    <Text style={styles.sectionHeading}>Common Topics</Text>
                    <TouchableOpacity style={styles.faqItem}>
                        <Text style={styles.faqText}>Payout Issues</Text>
                        <Icon name="plus" size={16} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.faqItem}>
                        <Text style={styles.faqText}>Verification Problems</Text>
                        <Icon name="plus" size={16} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.faqItem}>
                        <Text style={styles.faqText}>Managing Services</Text>
                        <Icon name="plus" size={16} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.versionInfo}>
                    <Text style={styles.versionText}>Services App v1.0.4 (Stable)</Text>
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
    heroTitle: {
        ...TYPOGRAPHY.h2,
        marginTop: SPACING.md,
        color: COLORS.text,
    },
    heroSubtext: {
        ...TYPOGRAPHY.bodySecondary,
        textAlign: 'center',
        marginTop: SPACING.xs,
        paddingHorizontal: SPACING.xl,
    },
    contactContainer: {
        gap: SPACING.md,
        marginBottom: SPACING.xxl,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: 12,
        ...SHADOWS.small,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    cardTextContent: {
        flex: 1,
    },
    cardTitle: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        color: COLORS.text,
    },
    cardSubtext: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    faqSection: {
        marginTop: SPACING.lg,
    },
    sectionHeading: {
        ...TYPOGRAPHY.h3,
        marginBottom: SPACING.md,
        color: COLORS.text,
    },
    faqItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    faqText: {
        ...TYPOGRAPHY.body,
        color: COLORS.text,
    },
    versionInfo: {
        marginTop: SPACING.xxl,
        paddingBottom: SPACING.xl,
        alignItems: 'center',
    },
    versionText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        opacity: 0.7,
    },
});

export default ContactSupportScreen;
