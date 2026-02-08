import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { COLORS } from '../theme/theme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
    onFinish?: () => void;
    loop?: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, loop = false }) => {
    const animationRef = useRef<LottieView>(null);

    useEffect(() => {
        if (animationRef.current && !loop) {
            animationRef.current.play();
        }

        // Auto-dismiss after 2 seconds if not looping
        if (!loop && onFinish) {
            const timer = setTimeout(() => {
                onFinish();
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [loop, onFinish]);

    return (
        <View style={styles.container}>
            <LottieView
                ref={animationRef}
                source={require('../assets/sahayaq_splash_Screen.json')}
                autoPlay
                loop={loop}
                style={styles.animation}
                resizeMode="cover"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    animation: {
        width: width,
        height: height,
    },
});

export default SplashScreen;
