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
import { useLanguage } from '../context/LanguageContext';
import { COLORS } from '../utils/theme';

const PrivacyPolicyScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { t, language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'te' : 'en');
    };

    const Section = ({ titleKey, contentKey }: { titleKey: string; contentKey: string }) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t(titleKey as any)}</Text>
            <Text style={styles.sectionText}>{t(contentKey as any)}</Text>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#2D3436" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('privacyTitle')}</Text>

                <TouchableOpacity style={styles.langToggle} onPress={toggleLanguage}>
                    <MaterialCommunityIcons name="translate" size={20} color={COLORS.primary} />
                    <Text style={styles.langText}>{language === 'en' ? 'తెలుగు' : 'English'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>{t('privacyIntro')}</Text>
                </View>

                <Section
                    titleKey="priv_1_title"
                    contentKey="priv_1_content"
                />

                <Section
                    titleKey="priv_2_title"
                    contentKey="priv_2_content"
                />

                <Section
                    titleKey="priv_3_title"
                    contentKey="priv_3_content"
                />

                <Section
                    titleKey="priv_4_title"
                    contentKey="priv_4_content"
                />

                <Section
                    titleKey="priv_5_title"
                    contentKey="priv_5_content"
                />

                <Section
                    titleKey="priv_6_title"
                    contentKey="priv_6_content"
                />

                <View style={styles.footer}>
                    <Text style={styles.lastUpdated}>{t('priv_last_updated')}</Text>
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
    langToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F3FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    langText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.primary,
    },
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
