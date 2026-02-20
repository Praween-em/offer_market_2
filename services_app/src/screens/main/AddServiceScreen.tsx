import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Switch,
    ActivityIndicator,
    Image,
    Platform,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { launchImageLibrary } from 'react-native-image-picker';
import { getCategoryAsset } from '../../utils/CategoryAssets';

const AddServiceScreen = ({ navigation, route }: any) => {
    const { user } = useAuth();
    const isEditing = route.params?.service ? true : false;
    const initialService = route.params?.service || {};

    const [title, setTitle] = useState(initialService.title || '');
    const [description, setDescription] = useState(initialService.description || '');
    const [price, setPrice] = useState(initialService.price ? String(initialService.price) : '');
    const [priceUnit, setPriceUnit] = useState(initialService.price_unit || 'visit');
    const [isActive, setIsActive] = useState(initialService.is_active !== undefined ? initialService.is_active : true);
    const [categoryId, setCategoryId] = useState(initialService.category_id || user?.provider?.category_id || '');
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [serviceImages, setServiceImages] = useState<string[]>(initialService.service_images?.map((si: any) => si.image_url) || []);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchSubCategories();
    }, []);

    const fetchSubCategories = async () => {
        try {
            setLoadingCategories(true);
            const providerCategoryId = user?.provider?.category_id;
            const response = await api.get('/services/categories');

            if (providerCategoryId) {
                // Find provider's category and show its sub-categories
                const rootCat = response.data.find((c: any) => c.id === providerCategoryId);
                if (rootCat) {
                    setCategories([rootCat]); // Just the provider's main category containing its sub-categories
                } else {
                    // Maybe the provider is assigned a sub-category directly. Search for it.
                    const parentCat = response.data.find((c: any) =>
                        c.sub_categories?.some((s: any) => s.id === providerCategoryId)
                    );
                    if (parentCat) {
                        setCategories([parentCat]);
                    } else {
                        setCategories(response.data);
                    }
                }
            } else {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    const priceUnits = ['visit', 'hour', 'day', 'sqft', 'item', 'session', 'job'];

    const pickImage = async () => {
        if (serviceImages.length >= 2) {
            Alert.alert('Limit Reached', 'You can upload up to 2 images per service.');
            return;
        }

        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.7,
        });

        if (result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            uploadImage(asset);
        }
    };

    const uploadImage = async (asset: any) => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
                type: asset.type,
                name: asset.fileName || 'service_work.jpg',
            } as any);

            const response = await api.post('/bunny/upload?folder=services', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setServiceImages(prev => [...prev, response.data.url]);
        } catch (error) {
            console.error('Upload failed', error);
            Alert.alert('Error', 'Could not upload photo.');
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setServiceImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Service title is required');
            return;
        }
        if (!price.trim()) {
            Alert.alert('Error', 'Price is required');
            return;
        }

        setLoading(true);

        const payload = {
            title,
            categoryId: categoryId || null,
            description,
            price: parseFloat(price),
            priceUnit,
            isActive,
            images: serviceImages,
        };

        try {
            if (isEditing) {
                await api.patch(`/services/manage/${initialService.id}`, payload);
                Alert.alert('Success', 'Service updated successfully');
            } else {
                await api.post('/services/manage', payload);
                Alert.alert('Success', 'Service created successfully');
            }
            navigation.goBack();
            // Optional: Trigger a refresh on the previous screen if needed (usually handled by onFocus or passing a callback)
            // But since ServicesScreen fetches on mount/refresh manually, we might just go back.
            // Ideally, we could navigate back with a param to signal refresh, or rely on react-navigation focus listener in ServicesScreen.
            // For now, ServicesScreen has a pull-to-refresh.
        } catch (error: any) {
            console.error('Save service error:', error);
            const msg = error.response?.data?.message || 'Failed to save service';
            Alert.alert('Error', msg);
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
                <Text style={TYPOGRAPHY.h2}>{isEditing ? 'Edit Service' : 'Add New Service'}</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Service Title *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., AC Repair, Deep Cleaning"
                            placeholderTextColor={COLORS.textSecondary}
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Service Category</Text>
                        <View style={styles.categoryContainer}>
                            {loadingCategories ? (
                                <ActivityIndicator size="small" color={COLORS.primary} />
                            ) : (
                                <View style={styles.categoriesWrapper}>
                                    {categories.map((cat: any) => (
                                        <View key={cat.id} style={styles.categoryGroup}>
                                            {/* Show root and children if they match provider profile later, for now show all */}
                                            {cat.sub_categories?.map((sub: any) => (
                                                <TouchableOpacity
                                                    key={sub.id}
                                                    style={[
                                                        styles.categoryChip,
                                                        categoryId === sub.id && styles.categoryChipSelected
                                                    ]}
                                                    onPress={() => setCategoryId(sub.id)}
                                                >
                                                    <View style={styles.chipContent}>
                                                        {getCategoryAsset(sub.name) && (
                                                            <Image
                                                                source={getCategoryAsset(sub.name)}
                                                                style={styles.chipIcon}
                                                            />
                                                        )}
                                                        <Text style={[
                                                            styles.categoryChipText,
                                                            categoryId === sub.id && styles.categoryChipTextSelected
                                                        ]}>
                                                            {sub.name}
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Describe what's included in this service..."
                            placeholderTextColor={COLORS.textSecondary}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Work Images (Max 2)</Text>
                            <Text style={styles.helperText}>{serviceImages.length}/2</Text>
                        </View>
                        <View style={styles.imageGallery}>
                            {serviceImages.map((uri, index) => (
                                <View key={index} style={styles.imageWrapper}>
                                    <Image source={{ uri }} style={styles.previewImage} />
                                    <TouchableOpacity
                                        style={styles.removeBadge}
                                        onPress={() => removeImage(index)}
                                    >
                                        <Icon name="x" size={12} color={COLORS.white} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {serviceImages.length < 2 && (
                                <TouchableOpacity
                                    style={[styles.uploadBtn, isUploading && styles.uploadBtnDisabled]}
                                    onPress={pickImage}
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <ActivityIndicator color={COLORS.primary} />
                                    ) : (
                                        <>
                                            <Icon name="plus" size={24} color={COLORS.primary} />
                                            <Text style={styles.uploadText}>Add Photo</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                        <Text style={styles.switchSubLabel}>
                            Show potential customers your actual work.
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.formGroup, { flex: 1, marginRight: SPACING.md }]}>
                            <Text style={styles.label}>Price (₹) *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                placeholderTextColor={COLORS.textSecondary}
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Per Unit</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.unitScroll}
                            >
                                {priceUnits.map((unit) => (
                                    <TouchableOpacity
                                        key={unit}
                                        style={[
                                            styles.unitChip,
                                            priceUnit === unit && styles.unitChipSelected
                                        ]}
                                        onPress={() => setPriceUnit(unit)}
                                    >
                                        <Text
                                            style={[
                                                styles.unitText,
                                                priceUnit === unit && styles.unitTextSelected
                                            ]}
                                        >
                                            {unit}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>

                    {isEditing && (
                        <View style={styles.switchContainer}>
                            <View>
                                <Text style={styles.switchLabel}>Active Status</Text>
                                <Text style={styles.switchSubLabel}>
                                    Hide this service without deleting it
                                </Text>
                            </View>
                            <Switch
                                value={isActive}
                                onValueChange={setIsActive}
                                trackColor={{ false: '#E5E7EB', true: `${COLORS.primary}50` }}
                                thumbColor={isActive ? COLORS.primary : '#F4F5F7'}
                            />
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.saveButtonText}>
                            {isEditing ? 'Update Service' : 'Create Service'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView >
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
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    backButton: {
        marginRight: SPACING.md,
    },
    content: {
        padding: SPACING.lg,
    },
    formGroup: {
        marginBottom: SPACING.lg,
    },
    label: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        marginBottom: SPACING.xs,
        color: COLORS.text,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    helperText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    imageGallery: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.sm,
    },
    imageWrapper: {
        position: 'relative',
        width: 100,
        height: 100,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        backgroundColor: `${COLORS.primary}05`,
    },
    removeBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: COLORS.error,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    uploadBtn: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
    },
    uploadBtnDisabled: {
        opacity: 0.6,
    },
    uploadText: {
        fontSize: 10,
        color: COLORS.primary,
        fontWeight: '700',
        marginTop: 4,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: SPACING.md,
        ...TYPOGRAPHY.body,
        color: COLORS.text,
    },
    textArea: {
        height: 120,
    },
    row: {
        flexDirection: 'row',
    },
    unitScroll: {
        paddingVertical: 4,
    },
    unitChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: 8,
    },
    unitChipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    unitText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    unitTextSelected: {
        color: COLORS.white,
        fontWeight: '600',
    },
    categoryContainer: {
        marginTop: SPACING.xs,
        marginBottom: SPACING.lg,
    },
    categoriesWrapper: {
        flexDirection: 'row',
    },
    categoryGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    categoryChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: 8,
        marginBottom: 8,
    },
    categoryChipSelected: {
        backgroundColor: `${COLORS.primary}15`,
        borderColor: COLORS.primary,
    },
    categoryChipText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    chipContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chipIcon: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 6,
    },
    categoryChipTextSelected: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.lg,
    },
    switchLabel: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
    },
    switchSubLabel: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    footer: {
        padding: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.md,
        borderRadius: 12,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        ...TYPOGRAPHY.button,
    },
});

export default AddServiceScreen;
