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
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../theme/theme';

export const REPORT_REASONS = [
    { label: 'Fake / Fraudulent', value: 'fake' },
    { label: 'Misleading Information', value: 'misleading' },
    { label: 'Expired / Not Available', value: 'expired' },
    { label: 'Inaccurate Details', value: 'inaccurate' },
    { label: 'Spam / Harassment', value: 'spam' },
    { label: 'Other', value: 'other' },
];

interface ReportModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (reason: string, notes: string) => Promise<void>;
    title?: string;
    subtitle?: string;
}

const ReportModal = ({ visible, onClose, onSubmit, title = "Report Issue", subtitle = "Please select a reason for reporting" }: ReportModalProps) => {
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
            Alert.alert('Required', 'Please select a reason for reporting');
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
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={TYPOGRAPHY.h2}>{title}</Text>
                        <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
                            <Icon name="x" size={24} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
                        <Text style={styles.subtitle}>{subtitle}</Text>

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
                                    <View style={[
                                        styles.radio,
                                        selectedReason === item.value && styles.selectedRadio
                                    ]}>
                                        {selectedReason === item.value && <View style={styles.radioInner} />}
                                    </View>
                                    <Text style={[
                                        styles.reasonLabel,
                                        selectedReason === item.value && styles.selectedReasonLabel
                                    ]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Provide more details about the issue..."
                            multiline
                            numberOfLines={4}
                            value={notes}
                            onChangeText={setNotes}
                            textAlignVertical="top"
                            editable={!isSubmitting}
                        />
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
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
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        padding: SPACING.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    scrollBody: {
        marginBottom: SPACING.lg,
    },
    subtitle: {
        ...TYPOGRAPHY.bodySecondary,
        marginBottom: SPACING.lg,
    },
    reasonsContainer: {
        gap: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    reasonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.background,
    },
    selectedReasonItem: {
        borderColor: COLORS.primary,
        backgroundColor: `${COLORS.primary}05`,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.textSecondary,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedRadio: {
        borderColor: COLORS.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },
    reasonLabel: {
        ...TYPOGRAPHY.body,
        fontSize: 15,
        color: COLORS.textSecondary,
    },
    selectedReasonLabel: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    inputLabel: {
        ...TYPOGRAPHY.body,
        fontWeight: '700',
        marginBottom: SPACING.sm,
    },
    textInput: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: 12,
        height: 100,
        ...TYPOGRAPHY.body,
        fontSize: 14,
        backgroundColor: COLORS.background,
    },
    footer: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cancelButtonText: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    submitButton: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.error,
        ...SHADOWS.small,
    },
    disabledButton: {
        opacity: 0.5,
        backgroundColor: COLORS.textSecondary,
    },
    submitButtonText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 16,
    },
});

export default ReportModal;
