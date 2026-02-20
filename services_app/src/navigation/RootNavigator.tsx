import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainNavigator from './MainNavigator';
import AuthNavigator from './AuthNavigator';
import { AuthProvider, useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

const Navigation = () => {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) {
        return null; // Or a splash screen
    }

    // If not logged in OR if user is not a service provider, show Auth/Onboarding
    const showAuth = !isAuthenticated || !user?.is_service_provider;

    console.log(`[RootNavigator] Auth Status:`, {
        isAuthenticated,
        isServiceProvider: user?.is_service_provider,
        showAuth
    });

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {showAuth ? (
                <Stack.Screen name="Auth" component={AuthNavigator} />
            ) : (
                <Stack.Screen name="Main" component={MainNavigator} />
            )}
        </Stack.Navigator>
    );
};

import { navigationRef } from './NavigationRef';
import { NotificationProvider } from '../context/NotificationContext';
import RandomVerificationModal from '../components/RandomVerificationModal';

const RootNavigator = () => {
    return (
        <AuthProvider>
            <NotificationProvider>
                <NavigationContainer ref={navigationRef}>
                    <Navigation />
                </NavigationContainer>
                <RandomVerificationModal />
            </NotificationProvider>
        </AuthProvider>
    );
};

export default RootNavigator;
