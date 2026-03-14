import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { COLORS } from '../utils/theme';

interface AddReviewModalProps {
    visible: boolean;
    providerId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({
    visible,
    providerId,
    onClose,
    onSuccess,
}) => {
    const { t } = useLanguage();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert(t('error') || 'Error', 'Please select a rating');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/reviews', {
                providerId,
                rating,
                comment,
            });
            Alert.alert(t('success') || 'Success', 'Your review has been submitted.');
            setRating(0);
            setComment('');
            onSuccess();
        } catch (error) {
            console.error('Submit review error:', error);
            Alert.alert(t('error') || 'Error', 'Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <View style={styles.container}>
                            <View style={styles.header}>
                                <Text style={styles.headerTitle}>Write a Review</Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                    <MaterialCommunityIcons name="close" size={24} color="#636E72" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>Rate your experience</Text>
                            <View style={styles.starsContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={star}
                                        onPress={() => setRating(star)}
                                        style={styles.starBtn}
                                    >
                                        <MaterialCommunityIcons
                                            name={star <= rating ? "star" : "star-outline"}
                                            size={40}
                                            color={star <= rating ? "#FFA502" : "#DFE6E9"}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>Share your thoughts (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Tell others about the service..."
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={4}
                                value={comment}
                                onChangeText={setComment}
                                textAlignVertical="top"
                            />

                            <TouchableOpacity
                                style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.submitBtnText}>Submit Review</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    keyboardView: {
        width: '100%',
    },
    container: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#2D3436',
    },
    closeBtn: {
        padding: 4,
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2D3436',
        marginBottom: 12,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 24,
    },
    starBtn: {
        padding: 4,
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        fontSize: 14,
        color: '#2D3436',
        height: 120,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#F1F2F6',
    },
    submitBtn: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitBtnDisabled: {
        backgroundColor: '#DFE6E9',
        shadowOpacity: 0,
        elevation: 0,
    },
    submitBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
});

export default AddReviewModal;
