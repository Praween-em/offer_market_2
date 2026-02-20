import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../context/LanguageContext';

const LanguageSettingsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { t, language, setLanguage } = useLanguage();

    const languages = [
        { code: 'en', label: t('english'), icon: 'translate' },
        { code: 'te', label: t('telugu'), icon: 'translate' },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#2D3436" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('language')}</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.subtitle}>{t('selectLanguage')}</Text>

                {languages.map((lang) => (
                    <TouchableOpacity
                        key={lang.code}
                        style={[
                            styles.languageItem,
                            language === lang.code && styles.activeLanguageItem
                        ]}
                        onPress={() => setLanguage(lang.code as any)}
                    >
                        <View style={styles.languageItemLeft}>
                            <View style={[
                                styles.iconContainer,
                                { backgroundColor: language === lang.code ? '#FF475710' : '#F1F2F6' }
                            ]}>
                                <MaterialCommunityIcons
                                    name={lang.icon}
                                    size={20}
                                    color={language === lang.code ? '#FF4757' : '#B2BEC3'}
                                />
                            </View>
                            <Text style={[
                                styles.languageLabel,
                                language === lang.code && styles.activeLanguageLabel
                            ]}>
                                {lang.label}
                            </Text>
                        </View>
                        {language === lang.code && (
                            <MaterialCommunityIcons name="check-circle" size={24} color="#FF4757" />
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
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
    content: {
        padding: 20,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#636E72',
        marginBottom: 20,
    },
    languageItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F2F6',
    },
    activeLanguageItem: {
        backgroundColor: '#FFF',
        borderColor: '#FF4757',
        borderWidth: 1.5,
    },
    languageItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    languageLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3436',
    },
    activeLanguageLabel: {
        color: '#FF4757',
        fontWeight: '800',
    },
});

export default LanguageSettingsScreen;
