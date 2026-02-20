import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../utils/theme';

export const REPORT_REASONS = [
    { label: 'Fake Profile', value: 'fake' },
    { label: 'Misleading Services', value: 'misleading' },
    { label: 'Wrong Pricing', value: 'inaccurate' },
    { label: 'Spam / Harassment', value: 'spam' },
    { label: 'Unprofessional Behavior', value: 'other' },
];

interface ReportModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (reason: string, notes: string) => Promise<void>;
}

const ReportModal = ({ visible, onClose, onSubmit }: ReportModalProps) => {
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClear = () => {
        setSelectedReason('');
        setNotes('');
        setIsSubmitting(false);
    };

    const handleSubmit = async () => {
        if (!selectedReason) {
            Alert.alert('Required', 'Please select a reason');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(selectedReason, notes);
            handleClear();
            onClose();
        } catch (error) {
            console.error('Report submission failed', error);
            Alert.alert('Error', 'Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Report Provider</Text>
                        <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
                            <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
                        <Text style={styles.subtitle}>Help us understand what's wrong</Text>

                        <View style={styles.reasonsContainer}>
                            {REPORT_REASONS.map((item) => (
                                <TouchableOpacity
                                    key={item.value}
                                    style={[
                                        styles.reasonItem,
                                        selectedReason === item.value && styles.selectedReasonItem
                                    ]}
                                    onPress={() => setSelectedReason(item.value)}
                                    disabled={isSubmitting}
                                >
                                    <MaterialCommunityIcons
                                        name={selectedReason === item.value ? "radiobox-marked" : "radiobox-blank"}
                                        size={22}
                                        color={selectedReason === item.value ? COLORS.primary : COLORS.textSecondary}
                                    />
                                    <Text style={[
                                        styles.reasonLabel,
                                        selectedReason === item.value && styles.selectedReasonLabel
                                    ]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.inputLabel}>Additional Details</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Tell us more (optional)..."
                            multiline
                            numberOfLines={3}
                            value={notes}
                            onChangeText={setNotes}
                            textAlignVertical="top"
                            editable={!isSubmitting}
                        />
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                (!selectedReason || isSubmitting) && styles.disabledButton
                            ]}
                            onPress={handleSubmit}
                            disabled={!selectedReason || isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color={COLORS.white} size="small" />
                            ) : (
                                <Text style={styles.submitButtonText}>Submit Report</Text>
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
        justifyContent: 'center',
        padding: 20,
    },
    content: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 20,
        maxHeight: '70%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
    },
    scrollBody: {
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 20,
    },
    reasonsContainer: {
        gap: 10,
        marginBottom: 20,
    },
    reasonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#F1F2F6',
    },
    selectedReasonItem: {
        borderColor: COLORS.primary,
        backgroundColor: `${COLORS.primary}05`,
    },
    reasonLabel: {
        fontSize: 15,
        color: COLORS.text,
        marginLeft: 12,
        fontWeight: '500',
    },
    selectedReasonLabel: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 10,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        height: 80,
        fontSize: 14,
        backgroundColor: '#F8F9FA',
        color: COLORS.text,
    },
    footer: {
        marginTop: 10,
    },
    submitButton: {
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.error,
    },
    disabledButton: {
        opacity: 0.5,
        backgroundColor: COLORS.textSecondary,
    },
    submitButtonText: {
        color: COLORS.white,
        fontWeight: '800',
        fontSize: 16,
    },
});

export default ReportModal;
