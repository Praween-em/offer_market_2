import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { COLORS, SPACING } from '../utils/theme';

interface Category {
    id: string;
    name: string;
    icon?: string;
    image_url?: string;
}

interface CategoryRailProps {
    categories: Category[];
    onCategoryPress: (categoryId: string, categoryName: string) => void;
    onViewAllPress: () => void;
}

const CategoryRail: React.FC<CategoryRailProps> = ({ categories, onCategoryPress, onViewAllPress }) => {
    const flatListRef = useRef<FlatList<Category>>(null);
    const [scrollIndex, setScrollIndex] = useState(0);
    const [isUserScrolling, setIsUserScrolling] = useState(false);
    const autoScrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scrollX = useRef(0);

    // Duplicate categories for seamless loop illusion
    // We create a larger set to allow scrolling for a while before resetting or just enough for the loop
    const duplicatedCategories = [...categories, ...categories, ...categories];

    useEffect(() => {
        startAutoScroll();

        return () => {
            stopAutoScroll();
            if (resumeTimer.current) clearTimeout(resumeTimer.current);
        };
    }, []);

    const startAutoScroll = () => {
        stopAutoScroll(); // Ensure no duplicate timers

        autoScrollTimer.current = setInterval(() => {
            if (!flatListRef.current || isUserScrolling) return;

            const cardWidth = 160 + SPACING.md; // width + margin
            const totalWidth = categories.length * cardWidth;

            // Increment scroll position
            scrollX.current += 1; // Smooth slow scroll

            // If we've scrolled past the first set of categories, reset to 0 (seamless loop)
            if (scrollX.current >= totalWidth) {
                scrollX.current = 0;
                flatListRef.current.scrollToOffset({ offset: 0, animated: false });
            } else {
                flatListRef.current.scrollToOffset({ offset: scrollX.current, animated: false });
            }

        }, 30); // 30ms for ~33fps smooth scroll
    };

    const stopAutoScroll = () => {
        if (autoScrollTimer.current) {
            clearInterval(autoScrollTimer.current);
            autoScrollTimer.current = null;
        }
    };

    const handleScrollBeginDrag = () => {
        setIsUserScrolling(true);
        stopAutoScroll();
        if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };

    const handleScrollEndDrag = () => {
        if (resumeTimer.current) clearTimeout(resumeTimer.current);

        // Resume after 2 seconds of inactivity
        resumeTimer.current = setTimeout(() => {
            setIsUserScrolling(false);
            // Sync our scrollX ref with the actual current scroll position from the list
            // However, since we are controlling it, it might be desynced. 
            // Better to let the auto-scroll resume from where it is.
            // But we need to update scrollX to avoid jumping back.
            // We can't easily get the current offset here without onScroll event.
            // Let's add onScroll to track it.
            startAutoScroll();
        }, 2000);
    };

    const handleMomentumScrollEnd = () => {
        // Also handle momentum end
        handleScrollEndDrag();
    };

    const onScroll = (event: any) => {
        // Keep our ref in sync when user scrolls
        if (isUserScrolling) {
            scrollX.current = event.nativeEvent.contentOffset.x;
        }
    };

    const renderItem = ({ item, index }: { item: Category, index: number }) => {
        const imageSource = item.image_url ? { uri: item.image_url } : null;

        return (
            <TouchableOpacity
                style={styles.categoryCard}
                onPress={() => onCategoryPress(item.id, item.name)}
                activeOpacity={0.9}
            >
                {imageSource ? (
                    <Image
                        source={imageSource}
                        style={styles.categoryImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.categoryImage, { backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ fontSize: 40 }}>{item.icon || '📦'}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    if (!categories || categories.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Categories</Text>
                <TouchableOpacity onPress={onViewAllPress}>
                    <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
            </View>
            {/* @ts-ignore */}
            <FlatList
                ref={flatListRef as any}
                data={duplicatedCategories}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                onScrollBeginDrag={handleScrollBeginDrag}
                onScrollEndDrag={handleScrollEndDrag}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                onScroll={onScroll}
                scrollEventThrottle={16}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        paddingVertical: 10,
        marginBottom: SPACING.sm,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.primary,
        letterSpacing: -0.5,
    },
    viewAllText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.primary,
        letterSpacing: 0.5,
    },
    listContent: {
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.sm,
    },
    // Big Card Styles
    categoryCard: {
        width: 160,
        height: 160,
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginRight: SPACING.md,
        overflow: 'hidden',
        // Shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F1F2F6',
    },
    categoryImage: {
        width: '100%',
        height: '110%',
    },
    categoryNameWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)', // Semi-transparent overlay
        paddingVertical: 8,
        paddingHorizontal: 8,
        alignItems: 'center',
    },
    categoryNameText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
    },
});

export default CategoryRail;
