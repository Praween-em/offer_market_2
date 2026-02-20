import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import ServicesSearchScreen from '../screens/ServicesSearchScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Placeholder component for the center button (won't be rendered)
const PlaceholderScreen = () => null;

// Custom floating action button component
const FloatingActionButton = () => {
    const navigation = useNavigation<any>();

    return (
        <View style={styles.fabContainer}>
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('PostServiceRequest')}
                activeOpacity={0.8}
            >
                <MaterialCommunityIcons name="plus" size={32} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
};

const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#3949AB',
                tabBarInactiveTintColor: '#B2BEC3',
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: '#F1F2F6',
                    backgroundColor: '#FFF',
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Categories"
                component={CategoriesScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="view-grid-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* Center floating action button */}
            <Tab.Screen
                name="PostRequest"
                component={PlaceholderScreen}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: () => <FloatingActionButton />,
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate('PostServiceRequest');
                    },
                })}
            />

            <Tab.Screen
                name="Search"
                component={ServicesSearchScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="magnify" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    fabContainer: {
        position: 'absolute',
        top: -28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#3949AB',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#3949AB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        borderWidth: 4,
        borderColor: '#FFF',
    },
});

export default MainTabNavigator;
