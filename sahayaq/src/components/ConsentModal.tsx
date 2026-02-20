
import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../services/api';

interface ConsentModalProps {
    visible: boolean;
    type: 'ONBOARDING' | 'LEAD_REVEAL' | 'OKYC_VERIFY';
    userId?: string;
    onAccept: (consentId?: string, noticeDetails?: any) => void;
    onCancel: () => void;
}

const ConsentModal = ({ visible, type, userId, onAccept, onCancel }: ConsentModalProps) => {
    const [notice, setNotice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchNotice();
        }
    }, [visible, type]);

    const fetchNotice = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/compliance/notices/${type}`);
            setNotice(response.data);
        } catch (error) {
            console.error('Failed to fetch legal notice:', error);
            Alert.alert('Error', 'Failed to load legal requirements. Please try again.');
            onCancel();
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        if (!notice) return;

        if (!userId) {
            // If no user ID (onboarding), just pass the notice info back
            onAccept(undefined, notice);
            return;
        }

        setAccepting(true);
        try {
            const response = await api.post('/compliance/consent', {
                userId,
                type: notice.type,
                version: notice.version
            });
            const consentId = response.data[0]?.consent_id || response.data.consent_id;
            onAccept(consentId, notice);
        } catch (error) {
            console.error('Failed to record consent:', error);
            Alert.alert('Error', 'Failed to record your consent. Please try again.');
        } finally {
            setAccepting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons
                                name={type === 'ONBOARDING' ? 'handshake-outline' : 'text-box-check-outline'}
                                size={32}
                                color="#00B894"
                            />
                        </View>
                        <Text style={styles.title}>
                            {type === 'ONBOARDING' ? 'Welcome to Sahayaq' : 'Ready to connect?'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {type === 'ONBOARDING' ? 'A quick privacy update before you start.' : 'Your privacy matters to us'}
                        </Text>
                    </View>

                    <View style={styles.noticeContainer}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#00B894" style={{ marginVertical: 40 }} />
                        ) : (
                            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                                <Text style={styles.noticeText}>
                                    {notice?.content || 'Loading legal terms...'}
                                </Text>
                                <Text style={styles.versionText}>Version: {notice?.version}</Text>
                            </ScrollView>
                        )}
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={onCancel}
                            disabled={accepting}
                        >
                            <Text style={styles.cancelBtnText}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.acceptBtn, accepting && styles.disabledBtn]}
                            onPress={handleAccept}
                            disabled={loading || accepting}
                        >
                            {accepting ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <Text style={styles.acceptBtnText}>Proceed</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        maxHeight: '85%',
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#00B89415',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#2D3436',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#636E72',
        fontWeight: '600',
        marginTop: 4,
    },
    noticeContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: 20,
        padding: 20,
        minHeight: 150,
        marginBottom: 24,
    },
    scrollView: {
        maxHeight: 300,
    },
    noticeText: {
        fontSize: 15,
        color: '#2D3436',
        lineHeight: 22,
    },
    versionText: {
        fontSize: 12,
        color: '#B2BEC3',
        marginTop: 12,
        fontStyle: 'italic',
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#F1F2F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#636E72',
    },
    acceptBtn: {
        flex: 2,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#00B894',
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledBtn: {
        backgroundColor: '#B2BEC3',
    },
    acceptBtnText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFF',
    }
});

export default ConsentModal;
