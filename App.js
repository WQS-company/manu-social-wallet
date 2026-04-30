import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth Screens
import SplashScreen from './screens/SplashScreen';
import GetStartedScreen from './screens/GetStartedScreen';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';

// Main Drawer Navigation
import DrawerNavigator from './navigation/DrawerNavigator';

// Global Search
import SearchScreen from './screens/SearchScreen';

// Newly Added Screens
import SupportScreen from './screens/SupportScreen';
import CommentScreen from './screens/CommentScreen';
import ShareScreen from './screens/ShareScreen';

// NEWLY ADDED PIN SCREEN
import SetPayoutPinScreen from './screens/SetPayoutPinScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {/* ====================== AUTH FLOW ====================== */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="GetStarted" component={GetStartedScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

        {/* ====================== MAIN APP ====================== */}
        <Stack.Screen name="MainApp" component={DrawerNavigator} />

        {/* ====================== SEARCH SCREEN ====================== */}
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ animation: 'slide_from_right' }}
        />

        {/* ====================== ADDED FEATURE SCREENS ====================== */}
        <Stack.Screen
          name="Support"
          component={SupportScreen}
          options={{ animation: 'slide_from_bottom' }}
        />

        <Stack.Screen
          name="Comments"
          component={CommentScreen}
          options={{ animation: 'slide_from_right' }}
        />

        <Stack.Screen
          name="Share"
          component={ShareScreen}
          options={{ animation: 'slide_from_bottom' }}
        />

        {/* ====================== PAYOUT PIN SCREEN ====================== */}
        <Stack.Screen
          name="SetPayoutPinScreen"
          component={SetPayoutPinScreen}
          options={{ animation: 'slide_from_bottom' }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
