import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    Alert,
    Dimensions,
    Animated,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }: any) => {
    const { user, updateUser } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedMainCategory, setSelectedMainCategory] = useState<any>(null);

    const [form, setForm] = useState({
        providerType: '', // 'individual' or 'business'
        displayName: '',
        bio: '',
        categoryId: '',
        experienceYears: '',
        startingPrice: '',
        serviceArea: '',
        whatsappNumber: '',
    });

    const progress = new Animated.Value((step - 1) / 4);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        Animated.timing(progress, {
            toValue: (step - 1) / 4,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [step]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await api.get('/services/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            Alert.alert('Error', 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (step === 1 && !form.providerType) {
            Alert.alert('Selection Required', 'Please select if you are an individual or a business');
            return;
        }
        if (step === 2 && !selectedMainCategory) {
            Alert.alert('Selection Required', 'Please select a service category');
            return;
        }
        if (step === 3 && !form.categoryId) {
            Alert.alert('Selection Required', 'Please select a sub-category');
            return;
        }
        setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            navigation.goBack();
        }
    };

    const handleOnboard = async () => {
        if (!form.displayName) {
            Alert.alert('Required Field', 'Please enter your name');
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post('/auth/onboard', {
                ...form,
                experienceYears: parseInt(form.experienceYears) || 0,
                startingPrice: parseFloat(form.startingPrice) || 0,
            });

            // Update local user state (specifically the role) to trigger navigation switch
            if (response.data.user) {
                console.log('[OnboardingScreen] Updating user data with:', response.data.user);
                await updateUser(response.data.user);
                console.log('[OnboardingScreen] User data updated in context');
            }

            Alert.alert('Success', 'Your profile has been created!', [
                { text: 'OK', onPress: () => console.log('[OnboardingScreen] Alert dismissed') }
            ]);
            // Navigation will happen automatically because of RootNavigator's role check
        } catch (error) {
            console.error('Onboarding error:', error);
            Alert.alert('Error', 'Failed to complete onboarding');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicatorContainer}>
            <View style={styles.progressBarBackground}>
                <Animated.View
                    style={[
                        styles.progressBarFill,
                        { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }
                    ]}
                />
            </View>
            <View style={styles.stepTextContainer}>
                <Text style={styles.stepText}>Step {step} of 4</Text>
            </View>
        </View>
    );

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Who are you?</Text>
            <Text style={styles.stepSubtitle}>Select the type of service provider you are</Text>

            <TouchableOpacity
                style={[styles.typeCard, form.providerType === 'individual' && styles.selectedCard]}
                onPress={() => setForm({ ...form, providerType: 'individual' })}
            >
                <Icon name="account" size={48} color={form.providerType === 'individual' ? COLORS.primary : COLORS.textSecondary} />
                <View style={styles.typeInfo}>
                    <Text style={styles.typeTitle}>Individual</Text>
                    <Text style={styles.typeDesc}>Independent professionals like mechanics, tutors, or freelancers.</Text>
                </View>
                <View style={[styles.radio, form.providerType === 'individual' && styles.radioActive]} />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.typeCard, form.providerType === 'business' && styles.selectedCard]}
                onPress={() => setForm({ ...form, providerType: 'business' })}
            >
                <Icon name="domain" size={48} color={form.providerType === 'business' ? COLORS.primary : COLORS.textSecondary} />
                <View style={styles.typeInfo}>
                    <Text style={styles.typeTitle}>Business / Shop</Text>
                    <Text style={styles.typeDesc}>Established shops, agencies, or service companies with multiple staff.</Text>
                </View>
                <View style={[styles.radio, form.providerType === 'business' && styles.radioActive]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={TYPOGRAPHY.button}>Continue</Text>
            </TouchableOpacity>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Select Category</Text>
            <Text style={styles.stepSubtitle}>What is your primary service area?</Text>

            <ScrollView>
                <View style={styles.categoryGrid}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.categoryCard, selectedMainCategory?.id === cat.id && styles.selectedCategoryCard]}
                            onPress={() => {
                                setSelectedMainCategory(cat);
                                // If NO subcategories, automatically select the main category as the categoryId
                                if (cat.sub_categories && cat.sub_categories.length === 0) {
                                    setForm({ ...form, categoryId: cat.id });
                                } else {
                                    setForm({ ...form, categoryId: '' }); // Reset sub-category
                                }
                            }}
                        >
                            <View style={[styles.iconContainer, selectedMainCategory?.id === cat.id && styles.selectedIconContainer]}>
                                <Icon
                                    name={cat.icon || 'star'}
                                    size={32}
                                    color={selectedMainCategory?.id === cat.id ? COLORS.white : COLORS.primary}
                                />
                            </View>
                            <Text style={styles.categoryName} numberOfLines={2}>{cat.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footerActions}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary }]}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.nextButton, { flex: 1, marginLeft: SPACING.md }]} onPress={handleNext}>
                    <Text style={TYPOGRAPHY.button}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{selectedMainCategory?.name}</Text>
            <Text style={styles.stepSubtitle}>Choose a specific sub-category</Text>

            <ScrollView>
                {selectedMainCategory?.sub_categories?.map((sub: any) => (
                    <TouchableOpacity
                        key={sub.id}
                        style={[styles.subCategoryItem, form.categoryId === sub.id && styles.selectedSubCategoryItem]}
                        onPress={() => setForm({ ...form, categoryId: sub.id })}
                    >
                        <View style={styles.subCategoryIcon}>
                            <Icon name={sub.icon || 'circle-outline'} size={24} color={form.categoryId === sub.id ? COLORS.primary : COLORS.textSecondary} />
                        </View>
                        <View style={styles.subCategoryInfo}>
                            <Text style={[styles.subCategoryName, form.categoryId === sub.id && styles.selectedSubCategoryText]}>{sub.name}</Text>
                            <Text style={styles.subCategoryDesc}>{sub.description}</Text>
                        </View>
                        {form.categoryId === sub.id && <Icon name="check-circle" size={24} color={COLORS.primary} />}
                    </TouchableOpacity>
                ))}

                {/* If no subcategories, allow selecting the main category itself or show an option */}
                {(!selectedMainCategory?.sub_categories || selectedMainCategory.sub_categories.length === 0) && (
                    <TouchableOpacity
                        key={selectedMainCategory?.id}
                        style={[styles.subCategoryItem, form.categoryId === selectedMainCategory?.id && styles.selectedSubCategoryItem]}
                        onPress={() => setForm({ ...form, categoryId: selectedMainCategory?.id })}
                    >
                        <View style={styles.subCategoryIcon}>
                            <Icon name="check-circle" size={24} color={form.categoryId === selectedMainCategory?.id ? COLORS.primary : COLORS.textSecondary} />
                        </View>
                        <Text style={[styles.subCategoryName, form.categoryId === selectedMainCategory?.id && styles.selectedSubCategoryText]}>
                            General {selectedMainCategory?.name}
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            <View style={styles.footerActions}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary }]}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.nextButton, { flex: 1, marginLeft: SPACING.md }]} onPress={handleNext}>
                    <Text style={TYPOGRAPHY.button}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderStep4 = () => (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.formContent}>
                <Text style={styles.stepTitle}>Final Details</Text>
                <Text style={styles.stepSubtitle}>Tell us more about your service</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{form.providerType === 'business' ? 'Business Name' : 'Full Name'} *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={form.providerType === 'business' ? "e.g. John's Garage" : "e.g. John Doe"}
                        value={form.displayName}
                        onChangeText={(text) => setForm({ ...form, displayName: text })}
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.sm }]}>
                        <Text style={styles.label}>Experience (Yrs)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 5"
                            keyboardType="number-pad"
                            value={form.experienceYears}
                            onChangeText={(text) => setForm({ ...form, experienceYears: text })}
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: SPACING.sm }]}>
                        <Text style={styles.label}>Starting Price (₹)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 500"
                            keyboardType="number-pad"
                            value={form.startingPrice}
                            onChangeText={(text) => setForm({ ...form, startingPrice: text })}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Service Area</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. South Delhi, Gurgaon"
                        value={form.serviceArea}
                        onChangeText={(text) => setForm({ ...form, serviceArea: text })}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>WhatsApp Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="10 digit number"
                        keyboardType="phone-pad"
                        value={form.whatsappNumber}
                        onChangeText={(text) => setForm({ ...form, whatsappNumber: text })}
                        maxLength={10}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>About Your Service</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe your expertise and what you offer..."
                        multiline
                        numberOfLines={4}
                        value={form.bio}
                        onChangeText={(text) => setForm({ ...form, bio: text })}
                    />
                </View>

                <View style={styles.footerActions}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary }]}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.submitButton, submitting && styles.buttonDisabled]}
                        onPress={handleOnboard}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={TYPOGRAPHY.button}>Complete</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.container}>
            {renderStepIndicator()}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading Categories...</Text>
                </View>
            ) : (
                <>
                    {console.log('[OnboardingScreen] Rendering Step:', step)}
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                </>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    stepIndicatorContainer: {
        padding: SPACING.lg,
        paddingBottom: 0,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: COLORS.border,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: SPACING.xs,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
    },
    stepText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    stepTextContainer: {
        alignItems: 'flex-end',
    },
    stepContainer: {
        flex: 1,
        padding: SPACING.lg,
    },
    stepTitle: {
        ...TYPOGRAPHY.h1,
        fontSize: 28,
        marginBottom: SPACING.xs,
    },
    stepSubtitle: {
        ...TYPOGRAPHY.bodySecondary,
        marginBottom: SPACING.xl,
    },
    typeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.lg,
        borderRadius: 16,
        marginBottom: SPACING.md,
        borderWidth: 2,
        borderColor: 'transparent',
        ...SHADOWS.small,
    },
    selectedCard: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.surface,
    },
    typeInfo: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    typeTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.text,
    },
    typeDesc: {
        ...TYPOGRAPHY.caption,
        marginTop: 4,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.border,
        marginLeft: SPACING.sm,
    },
    radioActive: {
        borderColor: COLORS.primary,
        borderWidth: 6,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: (width - SPACING.lg * 2 - SPACING.md) / 2,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        ...SHADOWS.small,
    },
    selectedCategoryCard: {
        borderColor: COLORS.primary,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    selectedIconContainer: {
        backgroundColor: COLORS.primary,
    },
    categoryName: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        textAlign: 'center',
    },
    subCategoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: 12,
        marginBottom: SPACING.sm,
        borderWidth: 2,
        borderColor: 'transparent',
        ...SHADOWS.small,
    },
    selectedSubCategoryItem: {
        borderColor: COLORS.primary,
    },
    subCategoryIcon: {
        marginRight: SPACING.md,
    },
    subCategoryInfo: {
        flex: 1,
    },
    subCategoryName: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
    },
    selectedSubCategoryText: {
        color: COLORS.primary,
    },
    subCategoryDesc: {
        ...TYPOGRAPHY.caption,
        marginTop: 2,
    },
    formContent: {
        padding: SPACING.lg,
    },
    inputGroup: {
        marginBottom: SPACING.md,
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        ...TYPOGRAPHY.caption,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: SPACING.md,
        ...TYPOGRAPHY.body,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    footerActions: {
        flexDirection: 'row',
        marginTop: 'auto',
        paddingVertical: SPACING.lg,
    },
    nextButton: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        flex: 1,
        marginLeft: SPACING.md,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        height: 56,
        paddingHorizontal: SPACING.lg,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: SPACING.md,
        ...TYPOGRAPHY.bodySecondary,
    },
});



export default OnboardingScreen;
