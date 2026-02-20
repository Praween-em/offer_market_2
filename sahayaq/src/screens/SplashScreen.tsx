import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { COLORS } from '../utils/theme';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
    return (
        <View style={styles.container}>
            <StatusBar hidden />
            <Image
                source={require('../assets/sahayaq.gif')}
                style={styles.gif}
                resizeMode="cover"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    gif: {
        width: width,
        height: height,
    },
});

export default SplashScreen;
