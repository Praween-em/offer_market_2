import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import VerifyOtpScreen from '../screens/auth/VerifyOtpScreen';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName={isAuthenticated ? "Onboarding" : "Login"}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </Stack.Navigator>
    );
};

export default AuthNavigator;
