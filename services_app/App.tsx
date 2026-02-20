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

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const { showRequest } = useRequestAlert();

  useEffect(() => {
    // Initialize Notifications & AdMob
    const setupApp = async () => {
      await mobileAds().initialize();
      await NotificationService.requestUserPermission();

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
    <RequestAlertProvider>
      <AppContent />
    </RequestAlertProvider>
  );
};

export default App;
