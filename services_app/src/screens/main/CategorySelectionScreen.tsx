import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import api from '../../services/api';

type Category = {
    id: string;
    name: string;
    parent_id: string | null;
    parent?: { id: string; name: string } | null;
};

const CategorySelectionScreen = ({ navigation }: any) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');

    const loadData = useCallback(async () => {
        try {
            const [catRes, selRes] = await Promise.all([
                api.get('/services/categories'),
                api.get('/services/selected-categories'),
            ]);
            setCategories(catRes.data);
            setSelectedIds(new Set(selRes.data as string[]));
        } catch (err) {
            Alert.alert('Error', 'Failed to load categories. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const toggleCategory = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/services/selected-categories', {
                categoryIds: Array.from(selectedIds),
            });
            Alert.alert('Saved', 'Your service categories have been updated.');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Error', 'Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Group categories by parent, filtered by search
    const grouped = useMemo(() => {
        const q = search.trim().toLowerCase();
        const result: { parentName: string; items: Category[] }[] = [];
        const parentMap = new Map<string, string>();
        categories.forEach(c => {
            if (!c.parent_id) parentMap.set(c.id, c.name);
        });

        const topLevel = categories.filter(c => !c.parent_id);
        topLevel.forEach(parent => {
            const children = categories.filter(c => c.parent_id === parent.id);
            const allItems = [parent, ...children];
            const filtered = q
                ? allItems.filter(c => c.name.toLowerCase().includes(q))
                : allItems;
            if (filtered.length > 0) {
                result.push({ parentName: parent.name, items: filtered });
            }
        });

        // Edge case: subcategories whose parent isn't listed
        categories
            .filter(c => c.parent_id && !parentMap.has(c.parent_id))
            .filter(c => !q || c.name.toLowerCase().includes(q))
            .forEach(c => {
                result.push({ parentName: c.parent?.name || 'Other', items: [c] });
            });

        return result;
    }, [categories, search]);

    const renderItem = ({ item }: { item: { parentName: string; items: Category[] } }) => (
        <View style={styles.group}>
            <Text style={styles.groupTitle}>{item.parentName}</Text>
            {item.items.map(cat => {
                const isParent = !cat.parent_id;
                const checked = selectedIds.has(cat.id);
                return (
                    <TouchableOpacity
                        key={cat.id}
                        style={[styles.row, isParent && styles.rowParent]}
                        onPress={() => toggleCategory(cat.id)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                            {checked && <Icon name="check" size={12} color={COLORS.white} />}
                        </View>
                        <Text style={[styles.rowText, isParent && styles.rowTextParent]}>
                            {cat.name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={TYPOGRAPHY.h2}>My Service Categories</Text>
            </View>

            <Text style={styles.subtitle}>
                Select all categories you serve. Your feed will include requests from every selected category.
            </Text>

            <View style={styles.searchContainer}>
                <Icon name="search" size={16} color={COLORS.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search categories..."
                    placeholderTextColor={COLORS.textSecondary}
                    value={search}
                    onChangeText={setSearch}
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')}>
                        <Icon name="x" size={16} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={grouped}
                    keyExtractor={item => item.parentName}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="search" size={32} color={COLORS.textSecondary} />
                            <Text style={styles.emptyText}>No categories match "{search}"</Text>
                        </View>
                    }
                />
            )}

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Categories</Text>
                    )}
                </TouchableOpacity>
            </View>
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
        padding: SPACING.lg,
        gap: SPACING.md,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: 4,
    },
    subtitle: {
        ...TYPOGRAPHY.bodySecondary,
        color: COLORS.textSecondary,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.sm,
        paddingHorizontal: SPACING.md,
        paddingVertical: 8,
        gap: SPACING.sm,
    },
    searchIcon: {
        marginRight: 2,
    },
    searchInput: {
        flex: 1,
        ...TYPOGRAPHY.body,
        color: COLORS.text,
        padding: 0,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: SPACING.md,
        paddingBottom: SPACING.xl,
    },
    group: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        marginBottom: SPACING.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.small,
    },
    groupTitle: {
        ...TYPOGRAPHY.body,
        fontWeight: '700',
        color: COLORS.primary,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: `${COLORS.primary}0D`,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: 12,
        gap: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    rowParent: {
        backgroundColor: `${COLORS.background}`,
    },
    rowText: {
        ...TYPOGRAPHY.body,
        flex: 1,
        paddingLeft: SPACING.md,
    },
    rowTextParent: {
        fontWeight: '600',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#16A34A',
        borderColor: '#16A34A',
    },
    footer: {
        padding: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        gap: SPACING.md,
    },
    emptyText: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    saveButton: {
        backgroundColor: '#16A34A',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        ...SHADOWS.small,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        ...TYPOGRAPHY.body,
        color: COLORS.white,
        fontWeight: '700',
    },
});

export default CategorySelectionScreen;
