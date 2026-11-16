import React, { useState, useEffect } from 'react';
import { StatusBar, AppState, AppStateStatus } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { COLORS } from './src/theme/theme';
import SplashScreen from './src/components/SplashScreen';
import NotificationService from './src/services/NotificationService';
import mobileAds from 'react-native-google-mobile-ads';
import { RequestAlertProvider, useRequestAlert } from './src/context/RequestAlertContext';
import IncomingRequestAlert from './src/components/IncomingRequestAlert';
import { NotificationProvider } from './src/context/NotificationContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const { showRequest } = useRequestAlert();

  useEffect(() => {
    // Initialize Notifications & AdMob
    const setupApp = async () => {
      try {
        await mobileAds().initialize();
      } catch (e) {
        console.log('[App] AdMob initialization failed gracefully', e);
      }

      try {
        await NotificationService.requestUserPermission();
      } catch (e) {
        console.log('[App] Notification permissions failed gracefully', e);
      }

      // Set the handler for new requests (Ring System)
      NotificationService.setAlertHandler((data) => {
        showRequest(data);
      });

      NotificationService.setupNotificationListeners();
    };
    setupApp();

    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <RootNavigator />
      <IncomingRequestAlert />
    </>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <RequestAlertProvider>
        <AppContent />
      </RequestAlertProvider>
    </SafeAreaProvider>
  );
};

export default App;
