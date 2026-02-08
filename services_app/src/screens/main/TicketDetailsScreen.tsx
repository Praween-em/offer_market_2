import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLORS = {
    open: { bg: '#EFF6FF', text: '#3B82F6' },
    in_progress: { bg: '#FEF3C7', text: '#F59E0B' },
    waiting_provider: { bg: '#F3E8FF', text: '#8B5CF6' },
    resolved: { bg: '#D1FAE5', text: '#10B981' },
    closed: { bg: '#F3F4F6', text: '#6B7280' },
};

const TicketDetailsScreen = ({ route, navigation }: any) => {
    const { ticketId } = route.params;
    const { user } = useAuth();
    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const fetchTicketDetails = async () => {
        try {
            const response = await api.get(`/tickets/${ticketId}`);
            setTicket(response.data);
        } catch (error) {
            console.error('Failed to fetch ticket details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicketDetails();
    }, [ticketId]);

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        setSending(true);
        try {
            await api.post(`/tickets/${ticketId}/messages`, {
                message: message.trim(),
            });
            setMessage('');
            await fetchTicketDetails();
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleCloseTicket = async () => {
        try {
            await api.patch(`/tickets/${ticketId}/close`);
            await fetchTicketDetails();
        } catch (error) {
            console.error('Failed to close ticket:', error);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!ticket) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>Ticket not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const statusConfig = STATUS_COLORS[ticket.status as keyof typeof STATUS_COLORS];
    const canReply = ticket.status !== 'closed';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.ticketNumber}>{ticket.ticket_number}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                        <Text style={[styles.statusText, { color: statusConfig.text }]}>
                            {ticket.status.replace(/_/g, ' ').toUpperCase()}
                        </Text>
                    </View>
                </View>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.ticketInfo}>
                        <Text style={styles.subject}>{ticket.subject}</Text>
                        <Text style={styles.description}>{ticket.description}</Text>
                        <View style={styles.metaRow}>
                            <View style={styles.metaItem}>
                                <Icon name="tag" size={14} color={COLORS.textSecondary} />
                                <Text style={styles.metaText}>
                                    {ticket.category.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                </Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Icon name="clock" size={14} color={COLORS.textSecondary} />
                                <Text style={styles.metaText}>
                                    {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {ticket.ticket_messages && ticket.ticket_messages.length > 0 && (
                        <View style={styles.messagesSection}>
                            <Text style={styles.sectionTitle}>Messages</Text>
                            {ticket.ticket_messages.map((msg: any) => {
                                const isProvider = msg.sender_id === user?.id;
                                return (
                                    <View
                                        key={msg.id}
                                        style={[
                                            styles.messageCard,
                                            isProvider ? styles.messageCardProvider : styles.messageCardSupport,
                                        ]}
                                    >
                                        <View style={styles.messageHeader}>
                                            <Text style={styles.messageSender}>
                                                {isProvider ? 'You' : msg.users.display_name || 'Support Team'}
                                            </Text>
                                            <Text style={styles.messageTime}>
                                                {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                            </Text>
                                        </View>
                                        <Text style={styles.messageText}>{msg.message}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </ScrollView>

                {canReply && (
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={message}
                            onChangeText={setMessage}
                            placeholder="Type your message..."
                            placeholderTextColor={COLORS.textSecondary}
                            multiline
                            maxLength={1000}
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, (!message.trim() || sending) && styles.sendButtonDisabled]}
                            onPress={handleSendMessage}
                            disabled={!message.trim() || sending}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <Icon name="send" size={20} color={COLORS.white} />
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {ticket.status === 'resolved' && (
                    <TouchableOpacity style={styles.closeButton} onPress={handleCloseTicket}>
                        <Icon name="check-circle" size={18} color={COLORS.white} />
                        <Text style={styles.closeButtonText}>Close Ticket</Text>
                    </TouchableOpacity>
                )}
            </KeyboardAvoidingView>
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
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
    },
    ticketNumber: {
        ...TYPOGRAPHY.body,
        fontWeight: '700',
        color: COLORS.primary,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: SPACING.lg,
    },
    ticketInfo: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        ...SHADOWS.small,
    },
    subject: {
        ...TYPOGRAPHY.h2,
        fontSize: 18,
        marginBottom: SPACING.sm,
        color: COLORS.text,
    },
    description: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        lineHeight: 22,
        marginBottom: SPACING.md,
    },
    metaRow: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    messagesSection: {
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h3,
        fontSize: 16,
        marginBottom: SPACING.md,
        color: COLORS.text,
    },
    messageCard: {
        borderRadius: 12,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
    },
    messageCardProvider: {
        backgroundColor: COLORS.primary + '15',
        alignSelf: 'flex-end',
        maxWidth: '85%',
    },
    messageCardSupport: {
        backgroundColor: COLORS.surface,
        alignSelf: 'flex-start',
        maxWidth: '85%',
        ...SHADOWS.small,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    messageSender: {
        ...TYPOGRAPHY.caption,
        fontWeight: '700',
        color: COLORS.text,
    },
    messageTime: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    messageText: {
        ...TYPOGRAPHY.body,
        color: COLORS.text,
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        gap: SPACING.sm,
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: 20,
        paddingHorizontal: SPACING.md,
        paddingVertical: 10,
        ...TYPOGRAPHY.body,
        color: COLORS.text,
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    closeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: COLORS.success,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        paddingVertical: 12,
        borderRadius: 12,
        ...SHADOWS.medium,
    },
    closeButtonText: {
        ...TYPOGRAPHY.body,
        fontWeight: '700',
        color: COLORS.white,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
    },
});

export default TicketDetailsScreen;
