import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/main/DashboardScreen';
import ServicesScreen from '../screens/main/ServicesScreen';
import FeedScreen from '../screens/main/FeedScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import { COLORS } from '../theme/theme';
import Icon from 'react-native-vector-icons/Feather';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
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
                    height: 60,
                    paddingBottom: 10,
                    paddingTop: 5,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.border,
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

export default TabNavigator;
