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

const TermsConditionsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { t, language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'te' : 'en');
    };

    const TermSection = ({ titleKey, pointKeys }: { titleKey: string; pointKeys: string[] }) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t(titleKey as any)}</Text>
            {pointKeys.map((key, index) => (
                <View key={index} style={styles.pointRow}>
                    <View style={styles.bullet} />
                    <Text style={styles.pointText}>{t(key as any)}</Text>
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
                <Text style={styles.headerTitle}>{t('termsTitle')}</Text>

                <TouchableOpacity style={styles.langToggle} onPress={toggleLanguage}>
                    <MaterialCommunityIcons name="translate" size={20} color={COLORS.primary} />
                    <Text style={styles.langText}>{language === 'en' ? 'తెలుగు' : 'English'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>{t('tosIntro')}</Text>
                </View>

                <TermSection
                    titleKey="tos_1_title"
                    pointKeys={["tos_1_p1", "tos_1_p2", "tos_1_p3"]}
                />

                <TermSection
                    titleKey="tos_2_title"
                    pointKeys={["tos_2_p1", "tos_2_p2", "tos_2_p3"]}
                />

                <TermSection
                    titleKey="tos_3_title"
                    pointKeys={["tos_3_p1", "tos_3_p2", "tos_3_p3"]}
                />

                <TermSection
                    titleKey="tos_4_title"
                    pointKeys={["tos_4_p1", "tos_4_p2", "tos_4_p3"]}
                />

                <TermSection
                    titleKey="tos_5_title"
                    pointKeys={["tos_5_p1", "tos_5_p2", "tos_5_p3"]}
                />

                <TermSection
                    titleKey="tos_6_title"
                    pointKeys={["tos_6_p1", "tos_6_p2"]}
                />

                <View style={styles.footer}>
                    <Text style={styles.lastUpdated}>{t('tos_last_updated')}</Text>
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
        backgroundColor: COLORS.primary,
        marginTop: 8,
        marginRight: 12,
    },
    pointText: { fontSize: 14, color: '#636E72', lineHeight: 22 },
    footer: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#F1F2F6', paddingTop: 20 },
    lastUpdated: { fontSize: 12, color: '#B2BEC3', textAlign: 'center', fontWeight: '700' },
});

export default TermsConditionsScreen;
