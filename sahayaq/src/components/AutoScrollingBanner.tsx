import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    Image,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';

const { width } = Dimensions.get('window');

interface BannerItem {
    id: string;
    title: string;
    image: string; // URL or local resource
    description?: string;
}

interface AutoScrollingBannerProps {
    data: BannerItem[];
}

const AutoScrollingBanner: React.FC<AutoScrollingBannerProps> = ({ data }) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            let nextIndex = currentIndex + 1;
            if (nextIndex >= data.length) {
                nextIndex = 0;
            }

            scrollViewRef.current?.scrollTo({
                x: nextIndex * width,
                animated: true,
            });
            setCurrentIndex(nextIndex);
        }, 3000); // Scroll every 3 seconds

        return () => clearInterval(interval);
    }, [currentIndex, data.length]);

    const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / width);
        setCurrentIndex(index);
    };

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onMomentumScrollEnd}
                scrollEventThrottle={16}
            >
                {data.map((item) => (
                    <View key={item.id} style={styles.bannerContainer}>
                        <Image source={{ uri: item.image }} style={styles.bannerImage} resizeMode="cover" />
                        <View style={styles.overlay}>
                            <View style={styles.textContainer}>
                                <Text style={styles.bannerTitle}>{item.title}</Text>
                                {item.description && <Text style={styles.bannerDesc}>{item.description}</Text>}
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
            <View style={styles.pagination}>
                {data.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.paginationDot,
                            index === currentIndex ? styles.paginationDotActive : null,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 180, // Vertical mobile top banner type height
        marginBottom: 10,
    },
    bannerContainer: {
        width: width,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    bannerImage: {
        width: '94%',
        height: '100%',
        borderRadius: 15,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: '3%', // Align with image width 94% (3% padding on each side)
        right: '3%',
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)', // Dark overlay for text readability
        borderRadius: 15,
        justifyContent: 'center',
        padding: 20,
    },
    textContainer: {
        alignItems: 'center',
    },
    bannerTitle: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    bannerDesc: {
        color: '#FFF',
        fontSize: 14,
        marginTop: 5,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    pagination: {
        position: 'absolute',
        bottom: 10,
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: '#FFF',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});

export default AutoScrollingBanner;
