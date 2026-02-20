import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Image,
    StatusBar,
    TextInput,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../services/api';
import { getServiceIcon } from '../utils/serviceIcons';
import { useLanguage } from '../context/LanguageContext';

const { height } = Dimensions.get('window');

const CategoriesScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { t, translateData } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [parents, setParents] = useState<any[]>([]);
    const [childrenMap, setChildrenMap] = useState<{ [key: string]: any[] }>({});
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [allCategories, setAllCategories] = useState<any[]>([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await api.get('/services/categories');
            const allCats = response.data || [];

            const parentList = allCats.filter((cat: any) => !cat.parent_id);
            const subMap: { [key: string]: any[] } = {};

            allCats.forEach((cat: any) => {
                if (cat.parent_id) {
                    if (!subMap[cat.parent_id]) subMap[cat.parent_id] = [];
                    subMap[cat.parent_id].push(cat);
                }
            });

            setParents(parentList);
            setChildrenMap(subMap);
            setAllCategories(allCats);
            if (parentList.length > 0) {
                setSelectedParentId(parentList[0].id);
            }
        } catch (error) {
            console.error('Fetch categories error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryPress = (category: any) => {
        // If it's a subcategory (has parent), go to search
        // Or if it's a parent with no subcategories, also go to search
        const hasChildren = childrenMap[category.id] && childrenMap[category.id].length > 0;

        if (category.parent_id || !hasChildren) {
            navigation.navigate('Search', { categoryId: category.id });
        } else {
            setSelectedParentId(category.id);
        }
    };

    const renderParentItem = ({ item }: { item: any }) => {
        const isSelected = selectedParentId === item.id;
        const icon = getServiceIcon(item.name);

        return (
            <TouchableOpacity
                style={[styles.parentItem, isSelected && styles.selectedParentItem]}
                onPress={() => setSelectedParentId(item.id)}
            >
                <View style={[styles.indicator, isSelected && styles.activeIndicator]} />
                <View style={styles.parentContent}>
                    {icon ? (
                        <Image
                            source={icon}
                            style={[styles.parentIconImage, { opacity: isSelected ? 1 : 0.6 }]}
                            resizeMode="contain"
                        />
                    ) : (
                        <MaterialCommunityIcons
                            name={item.icon || 'view-grid'}
                            size={22}
                            color={isSelected ? '#FF4757' : '#636E72'}
                        />
                    )}
                    <Text style={[styles.parentName, isSelected && styles.selectedParentName]}>
                        {translateData(item.name)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderChildItem = ({ item }: { item: any }) => {
        const icon = getServiceIcon(item.name);
        return (
            <TouchableOpacity
                style={styles.childCard}
                onPress={() => handleCategoryPress(item)}
            >
                <View style={styles.childIconContainer}>
                    {icon ? (
                        <Image source={icon} style={styles.childImage} resizeMode="contain" />
                    ) : (
                        <View style={styles.fallbackIcon}>
                            <MaterialCommunityIcons name={item.icon || 'tools'} size={30} color="#FF4757" />
                        </View>
                    )}
                </View>
                <Text style={styles.childName} numberOfLines={2}>{translateData(item.name)}</Text>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#FF4757" />
            </View>
        );
    }

    const currentSubcategories = selectedParentId ? (childrenMap[selectedParentId] || []) : [];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('allCategories')}</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBarWrapper}>
                <MaterialCommunityIcons name="magnify" size={20} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('searchCategory')}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    placeholderTextColor="#999"
                />
                {searchTerm ? (
                    <TouchableOpacity onPress={() => setSearchTerm('')}>
                        <MaterialCommunityIcons name="close-circle" size={18} color="#CCC" />
                    </TouchableOpacity>
                ) : null}
            </View>

            {searchTerm ? (
                <View style={styles.searchResultsContainer}>
                    <FlatList
                        data={allCategories.filter(c =>
                            translateData(c.name).toLowerCase().includes(searchTerm.toLowerCase())
                        )}
                        keyExtractor={(item) => `search-cat-${item.id}`}
                        renderItem={({ item }) => {
                            const parent = item.parent_id ? parents.find(p => p.id === item.parent_id) : null;
                            const icon = getServiceIcon(item.name);
                            return (
                                <TouchableOpacity
                                    style={styles.searchResultItem}
                                    onPress={() => {
                                        setSearchTerm('');
                                        handleCategoryPress(item);
                                    }}
                                >
                                    <View style={styles.searchResultIcon}>
                                        {icon ? (
                                            <Image source={icon} style={styles.searchResultImage} resizeMode="contain" />
                                        ) : (
                                            <MaterialCommunityIcons name={item.icon || (item.parent_id ? 'tag-outline' : 'view-grid')} size={24} color="#FF4757" />
                                        )}
                                    </View>
                                    <View style={styles.searchResultInfo}>
                                        <Text style={styles.searchResultName}>{translateData(item.name)}</Text>
                                        {parent && (
                                            <Text style={styles.searchResultParent}>{translateData(parent.name)}</Text>
                                        )}
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
                                </TouchableOpacity>
                            );
                        }}
                        ListEmptyComponent={() => (
                            <View style={styles.noResults}>
                                <MaterialCommunityIcons name="magnify-close" size={48} color="#E0E0E0" />
                                <Text style={styles.noResultsText}>{t('noCategoriesFound')}</Text>
                            </View>
                        )}
                        contentContainerStyle={styles.searchResultsList}
                    />
                </View>
            ) : (
                <View style={styles.content}>
                    {/* Sidebar */}
                    <View style={styles.sidebar}>
                        <FlatList
                            data={parents}
                            renderItem={renderParentItem}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>

                    {/* Main Content */}
                    <View style={styles.mainContent}>
                        <Text style={styles.subHeaderTitle}>
                            {translateData(parents.find(p => p.id === selectedParentId)?.name)} {t('services')}
                        </Text>
                        {currentSubcategories.length > 0 ? (
                            <FlatList
                                data={currentSubcategories}
                                renderItem={renderChildItem}
                                keyExtractor={(item) => item.id}
                                numColumns={2}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.childGrid}
                            />
                        ) : (
                            <View style={styles.noSubState}>
                                <MaterialCommunityIcons name="information-outline" size={48} color="#E0E0E0" />
                                <Text style={styles.noSubText}>{t('noSpecificSubcategories')}</Text>
                                <TouchableOpacity
                                    style={styles.viewBtn}
                                    onPress={() => handleCategoryPress(parents.find(p => p.id === selectedParentId))}
                                >
                                    <Text style={styles.viewBtnText}>{t('viewAllProviders')}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F2F6',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#2D3436',
    },
    content: {
        flex: 1,
        flexDirection: 'row',
    },
    sidebar: {
        width: 100,
        backgroundColor: '#F8F9FA',
        borderRightWidth: 1,
        borderRightColor: '#F1F2F6',
    },
    parentItem: {
        flexDirection: 'row',
        height: 100,
        alignItems: 'center',
    },
    selectedParentItem: {
        backgroundColor: '#FFF',
    },
    indicator: {
        width: 4,
        height: '100%',
        backgroundColor: 'transparent',
    },
    activeIndicator: {
        backgroundColor: '#FF4757',
    },
    parentContent: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    parentIconImage: {
        width: 32,
        height: 32,
    },
    parentName: {
        fontSize: 11,
        fontWeight: '600',
        color: '#636E72',
        textAlign: 'center',
        marginTop: 6,
    },
    selectedParentName: {
        color: '#2D3436',
        fontWeight: '700',
    },
    mainContent: {
        flex: 1,
        padding: 16,
    },
    subHeaderTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2D3436',
        marginBottom: 16,
    },
    childGrid: {
        paddingBottom: 20,
    },
    childCard: {
        flex: 1,
        maxWidth: '50%',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 12,
        margin: 6,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F2F6',
    },
    childIconContainer: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    childImage: {
        width: 80,
        height: 80,
    },
    fallbackIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    childName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2D3436',
        textAlign: 'center',
    },
    noSubState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    noSubText: {
        fontSize: 14,
        color: '#B2BEC3',
        marginTop: 12,
        marginBottom: 20,
    },
    viewBtn: {
        backgroundColor: '#FF4757',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    viewBtnText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 13,
    },
    searchBarWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F2F6',
        marginHorizontal: 16,
        marginVertical: 10,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#2D3436',
        marginLeft: 8,
    },
    searchResultsContainer: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    searchResultsList: {
        padding: 16,
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#F1F2F6',
    },
    searchResultIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    searchResultImage: {
        width: 32,
        height: 32,
    },
    searchResultInfo: {
        flex: 1,
    },
    searchResultName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2D3436',
    },
    searchResultParent: {
        fontSize: 11,
        color: '#636E72',
    },
    noResults: {
        alignItems: 'center',
        marginTop: 100,
    },
    noResultsText: {
        fontSize: 14,
        color: '#B2BEC3',
        marginTop: 12,
    },
});

export default CategoriesScreen;
