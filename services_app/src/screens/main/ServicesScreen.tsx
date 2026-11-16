import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ServicesScreen = ({ navigation }: any) => {
    const { refreshUser } = useAuth();
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await api.get('/services/my-profile');
            setServices(response.data.services || []);
        } catch (error: any) {
            console.error('Error fetching services:', error);
            if (error.response?.status !== 404) {
                Alert.alert('Error', 'Failed to load services');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleAddService = () => {
        navigation.navigate('AddService');
    };

    const handleEditService = (service: any) => {
        navigation.navigate('AddService', { service });
    };

    const handleDeleteService = (serviceId: string) => {
        Alert.alert(
            'Delete Service',
            'Are you sure you want to delete this service?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/services/manage/${serviceId}`);
                            Alert.alert('Success', 'Service deleted successfully');
                            fetchServices();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete service');
                        }
                    },
                },
            ]
        );
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            fetchServices(),
            refreshUser()
        ]);
        setRefreshing(false);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={TYPOGRAPHY.h1}>My Services</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={TYPOGRAPHY.h1}>My Services</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddService}>
                    <Icon name="plus" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
                }
            >
                {services.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconCircle}>
                            <Icon name="briefcase" size={48} color={COLORS.border} />
                        </View>
                        <Text style={styles.emptyText}>No services added yet</Text>
                        <Text style={styles.emptySubtext}>
                            Add your first service to start receiving requests
                        </Text>
                        <TouchableOpacity style={styles.createButton} onPress={handleAddService}>
                            <Text style={TYPOGRAPHY.button}>Add First Service</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    services.map((service) => (
                        <View key={service.id} style={styles.serviceCard}>
                            <View style={styles.imageContainer}>
                                {service.service_images && service.service_images.length > 0 ? (
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={() => setSelectedImage(service.service_images[0].image_url)}
                                        style={styles.imageWrapper}
                                    >
                                        <Image
                                            source={{ uri: service.service_images[0].image_url }}
                                            style={styles.serviceImage}
                                            resizeMode="contain"
                                        />
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.serviceIcon}>
                                        <Icon name="zap" size={20} color={COLORS.primary} />
                                    </View>
                                )}
                            </View>
                            <View style={styles.serviceInfo}>
                                <Text style={styles.serviceTitle}>{service.title}</Text>
                                {service.description && (
                                    <Text style={styles.serviceDescription} numberOfLines={2}>
                                        {service.description}
                                    </Text>
                                )}
                                <Text style={styles.servicePrice}>
                                    ₹{service.price} <Text style={styles.priceUnit}>/ {service.price_unit}</Text>
                                </Text>
                                {service.service_categories && (
                                    <View style={styles.categoryBadge}>
                                        <Icon name="tag" size={10} color={COLORS.primary} />
                                        <Text style={styles.categoryText}>{service.service_categories.name}</Text>
                                    </View>
                                )}
                                {!service.is_active && (
                                    <View style={styles.inactiveBadge}>
                                        <Text style={styles.inactiveText}>Inactive</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={styles.editIcon}
                                    onPress={() => handleEditService(service)}
                                >
                                    <Icon name="edit-2" size={18} color={COLORS.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteIcon}
                                    onPress={() => handleDeleteService(service.id)}
                                >
                                    <Icon name="trash-2" size={18} color={COLORS.error} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Full Screen Image Viewer Modal */}
            <Modal
                visible={!!selectedImage}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedImage(null)}
            >
                <View style={styles.fullScreenModal}>
                    <TouchableOpacity
                        style={styles.closeModal}
                        onPress={() => setSelectedImage(null)}
                    >
                        <Icon name="x" size={30} color="#FFF" />
                    </TouchableOpacity>
                    <Image
                        source={{ uri: selectedImage || '' }}
                        style={styles.fullImage}
                        resizeMode="contain"
                    />
                </View>
            </Modal>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    scrollContent: {
        padding: SPACING.md,
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.xxl * 2,
    },
    emptyIconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
    },
    emptyText: {
        ...TYPOGRAPHY.h3,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    emptySubtext: {
        ...TYPOGRAPHY.bodySecondary,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
        paddingHorizontal: SPACING.xl,
    },
    createButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: 12,
        ...SHADOWS.medium,
    },
    serviceCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: 16,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.small,
    },
    imageContainer: {
        width: 80,
        height: 80,
        backgroundColor: `${COLORS.primary}10`,
        borderRadius: 12,
        marginRight: SPACING.md,
        overflow: 'hidden',
    },
    serviceImage: {
        width: '100%',
        height: '100%',
    },
    serviceIcon: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    serviceInfo: {
        flex: 1,
    },
    serviceTitle: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        marginBottom: 4,
    },
    serviceDescription: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    servicePrice: {
        ...TYPOGRAPHY.body,
        color: COLORS.primary,
        fontWeight: '700',
    },
    priceUnit: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        fontWeight: '400',
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${COLORS.primary}10`,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginTop: 6,
        alignSelf: 'flex-start',
        gap: 4,
    },
    categoryText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.primary,
        fontSize: 10,
        fontWeight: '600',
    },
    inactiveBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#FEE2E2',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 4,
    },
    inactiveText: {
        ...TYPOGRAPHY.caption,
        color: '#DC2626',
        fontWeight: '600',
    },
    actions: {
        justifyContent: 'center',
        gap: SPACING.sm,
    },
    editIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: `${COLORS.primary}10`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageWrapper: {
        width: '100%',
        height: '100%',
    },
    fullScreenModal: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    closeModal: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1001,
        padding: 10,
    },
    fullImage: {
        width: '100%',
        height: '90%',
    },
});

export default ServicesScreen;
