import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import DashboardScreen from '../screens/DashboardScreen';
import RequestHelpScreen from '../screens/RequestHelpScreen';
import MyRequestsScreen from '../screens/MyRequestsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        // ✅ THIS IS THE MAIN FIX
        tabBarHideOnKeyboard: false,

        tabBarActiveTintColor: '#1E90FF',
        tabBarInactiveTintColor: '#999',

        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          height: 60,
          elevation: 12,
          paddingBottom: 6,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: 4,
        },

        tabBarIcon: ({ color, size }) => {
          let icon = 'home-outline';

          if (route.name === 'Dashboard') icon = 'home-outline';
          if (route.name === 'Request Help') icon = 'add-circle-outline';
          if (route.name === 'My Requests') icon = 'list-outline';
          if (route.name === 'Profile') icon = 'person-outline';

          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Request Help" component={RequestHelpScreen} />
      <Tab.Screen name="My Requests" component={MyRequestsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
