import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import BusinessSettingsScreen from '../screens/main/BusinessSettingsScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import PaymentsScreen from '../screens/main/PaymentsScreen';
import HelpCenterScreen from '../screens/main/HelpCenterScreen';
import PrivacyPolicyScreen from '../screens/main/PrivacyPolicyScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import VerificationScreen from '../screens/main/VerificationScreen';
import AddServiceScreen from '../screens/main/AddServiceScreen';
import TermsOfServiceScreen from '../screens/main/TermsOfServiceScreen';
import ContactSupportScreen from '../screens/main/ContactSupportScreen';
import AboutOferaScreen from '../screens/main/AboutOferaScreen';

import ServiceRequestDetailsScreen from '../screens/main/ServiceRequestDetailsScreen';
import NomineeScreen from '../screens/main/NomineeScreen';
import PrivacySecurityScreen from '../screens/main/PrivacySecurityScreen';
import SupportScreen from '../screens/main/SupportScreen';
import CreateTicketScreen from '../screens/main/CreateTicketScreen';
import TicketDetailsScreen from '../screens/main/TicketDetailsScreen';

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tabs" component={TabNavigator} />
            <Stack.Screen name="BusinessSettings" component={BusinessSettingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Payments" component={PaymentsScreen} />
            <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Verification" component={VerificationScreen} />
            <Stack.Screen name="AddService" component={AddServiceScreen} />
            <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
            <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
            <Stack.Screen name="About" component={AboutOferaScreen} />
            <Stack.Screen name="ServiceRequestDetails" component={ServiceRequestDetailsScreen} />
            <Stack.Screen name="Nominee" component={NomineeScreen} />
            <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
            <Stack.Screen name="Support" component={SupportScreen} />
            <Stack.Screen name="CreateTicket" component={CreateTicketScreen} />
            <Stack.Screen name="TicketDetails" component={TicketDetailsScreen} />
        </Stack.Navigator>
    );
};

export default MainNavigator;
