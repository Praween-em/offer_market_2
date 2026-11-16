import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import api from '../../services/api';

const CATEGORIES = [
    { value: 'payment_dispute', label: 'Payment Dispute', icon: 'dollar-sign' },
    { value: 'account_issue', label: 'Account Issue', icon: 'user-x' },
    { value: 'platform_bug', label: 'Platform Bug', icon: 'alert-triangle' },
    { value: 'policy_question', label: 'Policy Question', icon: 'help-circle' },
    { value: 'lead_quality', label: 'Lead Quality', icon: 'trending-down' },
    { value: 'verification_issue', label: 'Verification Issue', icon: 'shield-off' },
    { value: 'other', label: 'Other', icon: 'message-circle' },
];

const PRIORITIES = [
    { value: 'low', label: 'Low', color: '#10B981' },
    { value: 'medium', label: 'Medium', color: '#F59E0B' },
    { value: 'high', label: 'High', color: '#EF4444' },
    { value: 'urgent', label: 'Urgent', color: '#DC2626' },
];

const CreateTicketScreen = ({ navigation }: any) => {
    const [category, setCategory] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!category) {
            Alert.alert('Error', 'Please select a category');
            return;
        }

        if (!subject.trim()) {
            Alert.alert('Error', 'Please enter a subject');
            return;
        }

        if (!description.trim()) {
            Alert.alert('Error', 'Please describe your issue');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/tickets', {
                category,
                subject: subject.trim(),
                description: description.trim(),
                priority,
            });

            Alert.alert('Success', 'Your ticket has been created successfully', [
                {
                    text: 'OK',
                    onPress: () => navigation.navigate('TicketDetails', { ticketId: response.data.id }),
                },
            ]);
        } catch (error: any) {
            console.error('Failed to create ticket:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Ticket</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.label}>Category *</Text>
                    <View style={styles.categoryGrid}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.value}
                                style={[
                                    styles.categoryButton,
                                    category === cat.value && styles.categoryButtonActive,
                                ]}
                                onPress={() => setCategory(cat.value)}
                            >
                                <Icon
                                    name={cat.icon}
                                    size={20}
                                    color={category === cat.value ? COLORS.white : COLORS.primary}
                                />
                                <Text
                                    style={[
                                        styles.categoryText,
                                        category === cat.value && styles.categoryTextActive,
                                    ]}
                                >
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Subject *</Text>
                    <TextInput
                        style={styles.input}
                        value={subject}
                        onChangeText={setSubject}
                        placeholder="Brief summary of your issue"
                        placeholderTextColor={COLORS.textSecondary}
                        maxLength={255}
                    />
                    <Text style={styles.helperText}>{subject.length}/255</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Description *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Provide detailed information about your issue"
                        placeholderTextColor={COLORS.textSecondary}
                        multiline
                        numberOfLines={8}
                        textAlignVertical="top"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Priority</Text>
                    <View style={styles.priorityRow}>
                        {PRIORITIES.map((pri) => (
                            <TouchableOpacity
                                key={pri.value}
                                style={[
                                    styles.priorityButton,
                                    priority === pri.value && { backgroundColor: pri.color },
                                ]}
                                onPress={() => setPriority(pri.value)}
                            >
                                <Text
                                    style={[
                                        styles.priorityText,
                                        priority === pri.value && styles.priorityTextActive,
                                    ]}
                                >
                                    {pri.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <>
                            <Icon name="send" size={18} color={COLORS.white} />
                            <Text style={styles.submitText}>Submit Ticket</Text>
                        </>
                    )}
                </TouchableOpacity>
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
        justifyContent: 'space-between',
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: SPACING.xs,
    },
    headerTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 18,
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    label: {
        ...TYPOGRAPHY.body,
        fontWeight: '700',
        marginBottom: SPACING.sm,
        color: COLORS.text,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: SPACING.md,
        borderRadius: 12,
        backgroundColor: COLORS.surface,
        borderWidth: 2,
        borderColor: COLORS.border,
    },
    categoryButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryText: {
        ...TYPOGRAPHY.body,
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.text,
    },
    categoryTextActive: {
        color: COLORS.white,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: SPACING.md,
        ...TYPOGRAPHY.body,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    textArea: {
        minHeight: 150,
    },
    helperText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        marginTop: 4,
        textAlign: 'right',
    },
    priorityRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    priorityButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: SPACING.md,
        borderRadius: 8,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    priorityText: {
        ...TYPOGRAPHY.body,
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.text,
    },
    priorityTextActive: {
        color: COLORS.white,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: SPACING.lg,
        marginBottom: SPACING.xxl,
        ...SHADOWS.medium,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitText: {
        ...TYPOGRAPHY.body,
        fontWeight: '700',
        color: COLORS.white,
        fontSize: 16,
    },
});

export default CreateTicketScreen;
