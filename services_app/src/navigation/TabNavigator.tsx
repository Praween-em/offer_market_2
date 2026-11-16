import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/main/DashboardScreen';
import ServicesScreen from '../screens/main/ServicesScreen';
import FeedScreen from '../screens/main/FeedScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import { COLORS } from '../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

const TabNavigatorInner = () => {
    const insets = useSafeAreaInsets();
    
    // On Android 15+, insets.bottom will represent the navigation bar height
    // We adjust the tab bar height and padding to ensure icons are correctly placed
    const bottomPadding = insets.bottom > 0 ? insets.bottom : 10;
    const tabBarHeight = 60 + insets.bottom;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName: string = 'grid';

                    if (route.name === 'Home') {
                        iconName = 'home';
                    } else if (route.name === 'Services') {
                        iconName = 'briefcase';
                    } else if (route.name === 'Dashboard') {
                        iconName = 'grid';
                    } else if (route.name === 'Profile') {
                        iconName = 'user';
                    }

                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
                headerShown: false,
                tabBarStyle: {
                    height: tabBarHeight,
                    paddingBottom: bottomPadding,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.border,
                    backgroundColor: COLORS.surface,
                    // Raise above Android gesture navigation bar
                    elevation: 8,
                },
            })}
        >
            <Tab.Screen name="Home" component={FeedScreen} />
            <Tab.Screen name="Services" component={ServicesScreen} />
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

const TabNavigator = () => {
    return <TabNavigatorInner />;
};

export default TabNavigator;
