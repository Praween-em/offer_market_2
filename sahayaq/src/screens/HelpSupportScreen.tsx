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

const HelpSupportScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { t } = useLanguage();

    const ContactItem = ({ icon, title, subtitle, onPress, color = '#2D3436' }: any) => (
        <TouchableOpacity style={styles.contactItem} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}10` }]}>
                <MaterialCommunityIcons name={icon} size={24} color={color} />
            </View>
            <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{title}</Text>
                <Text style={styles.contactSubtitle}>{subtitle}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#B2BEC3" />
        </TouchableOpacity>
    );

    const FAQItem = ({ question, answer }: any) => (
        <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{question}</Text>
            <Text style={styles.faqAnswer}>{answer}</Text>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#2D3436" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>How can we help you?</Text>
                    <Text style={styles.heroSubtitle}>Our support team is available from 9 AM to 7 PM</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Us</Text>
                    <ContactItem
                        icon="whatsapp"
                        title="WhatsApp Support"
                        subtitle="+91 8374277617"
                        color="#25D366"
                        onPress={() => Linking.openURL('whatsapp://send?phone=+918374277617')}
                    />
                    <ContactItem
                        icon="email-outline"
                        title="Email Us"
                        subtitle="help.rideandhra@gmail.com"
                        color="#FF4757"
                        onPress={() => Linking.openURL('mailto:help.rideandhra@gmail.com')}
                    />
                    <ContactItem
                        icon="phone-outline"
                        title="Call Support"
                        subtitle="+91 8374277617"
                        color="#2196F3"
                        onPress={() => Linking.openURL('tel:+918374277617')}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                    <FAQItem
                        question="How do I post a service request?"
                        answer="Tap on the 'Post Request' button on the home screen, select a category, and describe what you need."
                    />
                    <FAQItem
                        question="Is my data safe?"
                        answer="Yes, we follow strict data protection laws (DPDP Act). Your contact is only revealed to up to 3 verified providers."
                    />
                    <FAQItem
                        question="What are lead reveals?"
                        answer="When a provider wants to help you, they 'unlock' your contact. Only a maximum of 3 providers can do this for any request."
                    />
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
    heroSection: { marginBottom: 30, paddingHorizontal: 4 },
    heroTitle: { fontSize: 28, fontWeight: '900', color: '#2D3436', marginBottom: 8 },
    heroSubtitle: { fontSize: 16, color: '#636E72' },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2D3436', marginBottom: 16, paddingHorizontal: 4 },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F2F6',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contactInfo: { flex: 1 },
    contactTitle: { fontSize: 16, fontWeight: '700', color: '#2D3436' },
    contactSubtitle: { fontSize: 14, color: '#636E72' },
    faqItem: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F2F6',
    },
    faqQuestion: { fontSize: 15, fontWeight: '700', color: '#2D3436', marginBottom: 8 },
    faqAnswer: { fontSize: 14, color: '#636E72', lineHeight: 20 },
});

export default HelpSupportScreen;
