
import React, { useEffect } from 'react';
import mobileAds from 'react-native-google-mobile-ads';
import NotificationService from './src/services/NotificationService';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import OTPScreen from './src/screens/OTPScreen';
import PostServiceRequestScreen from './src/screens/PostServiceRequestScreen';
import ServiceProviderDetailsScreen from './src/screens/ServiceProviderDetailsScreen';
import ServiceRequestsScreen from './src/screens/ServiceRequestsScreen';
import ServiceRequestDetailsScreen from './src/screens/ServiceRequestDetailsScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import LanguageSettingsScreen from './src/screens/LanguageSettingsScreen';
import LocationSettingsScreen from './src/screens/LocationSettingsScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import PrivacySecurityScreen from './src/screens/PrivacySecurityScreen';
import SplashScreen from './src/screens/SplashScreen';
import HelpSupportScreen from './src/screens/HelpSupportScreen';
import AboutAppScreen from './src/screens/AboutAppScreen';
import TermsConditionsScreen from './src/screens/TermsConditionsScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import { LanguageProvider } from './src/context/LanguageContext';
import { LocationProvider } from './src/context/LocationContext';
import { COLORS } from './src/utils/theme';

import { NotificationProvider } from './src/context/NotificationContext';

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

const AppNavigator = () => {
  const { token, isLoading } = useAuth();
  const [showSplash, setShowSplash] = React.useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || showSplash) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {token ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="PostServiceRequest" component={PostServiceRequestScreen} />
          <Stack.Screen name="ServiceProviderDetails" component={ServiceProviderDetailsScreen} />
          <Stack.Screen name="ServiceRequests" component={ServiceRequestsScreen} />
          <Stack.Screen name="ServiceRequestDetails" component={ServiceRequestDetailsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
          <Stack.Screen name="LocationSettings" component={LocationSettingsScreen} />
          <Stack.Screen name="Notification" component={NotificationScreen} />
          <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          <Stack.Screen name="AboutApp" component={AboutAppScreen} />
          <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        </Stack.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="OTP" component={OTPScreen} />
          <AuthStack.Screen name="TermsConditions" component={TermsConditionsScreen} />
          <AuthStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
};

const App = () => {
  useEffect(() => {
    const initApp = async () => {
      // Initialize AdMob
      try {
        await mobileAds().initialize();
        console.log('AdMob Initialized');
      } catch (error) {
        console.error('AdMob Initialization Error:', error);
      }

      await NotificationService.requestUserPermission();
      NotificationService.setupNotificationListeners();
    };
    initApp();
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <LanguageProvider>
          <LocationProvider>
            <AppNavigator />
          </LocationProvider>
        </LanguageProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default App;
