import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from '../api/axios';

import Svg, { Path } from 'react-native-svg';

const SPLASH_DURATION = 5000; // 5 seconds splash

export default function SplashScreen({ navigation }) {
  const [checking, setChecking] = useState(true);
  const [offline, setOffline] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ---------------------- LOGO ANIMATION ----------------------
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ---------------------- MAIN FLOW ----------------------
  useEffect(() => {
    let mounted = true;

    const startFlow = async () => {
      await new Promise(resolve => setTimeout(resolve, SPLASH_DURATION));

      const state = await NetInfo.fetch();

      if (!state.isConnected || !state.isInternetReachable) {
        if (!mounted) return;
        setOffline(true);
        setChecking(false);
        return;
      }

      checkAuth();
    };

    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        if (!token) {
          if (!mounted) return;
          navigation.replace('GetStarted');
          return;
        }

        const res = await axios.get('?action=me');

        if (res?.data?.user) {
          await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
          if (!mounted) return;
          navigation.replace('MainApp');
        } else {
          throw new Error('Invalid session');
        }
      } catch (err) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        if (!mounted) return;
        navigation.replace('GetStarted');
      } finally {
        if (mounted) setChecking(false);
      }
    };

    startFlow();
    return () => {
      mounted = false;
    };
  }, [navigation]);

  // ---------------------- RETRY INTERNET ----------------------
  const handleRetry = async () => {
    setChecking(true);
    const state = await NetInfo.fetch();

    if (state.isConnected && state.isInternetReachable) {
      setOffline(false);
      navigation.replace('Splash');
    } else {
      setChecking(false);
    }
  };

  // ---------------------- OFFLINE SCREEN ----------------------
  if (offline) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0B2C33" />

        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
            marginBottom: 25,
          }}
        >
          <SLogo />
        </Animated.View>

        <Text style={styles.offlineTitle}>No Internet Connection</Text>
        <Text style={styles.offlineText}>
          Support Menu needs an active internet connection to securely connect
          you with support services and trusted helpers.
        </Text>

        <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
          <Text style={styles.retryText}>Retry Connection</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---------------------- MAIN SPLASH VIEW ----------------------
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B2C33" />

      <Animated.View
        style={[
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
            marginBottom: 25,
          },
        ]}
      >
        <SLogo />
      </Animated.View>

      <Text style={styles.title}>Support Menu</Text>

      <Text style={styles.tagline}>
        Connecting People With Care, Dignity & Trust
      </Text>

      {checking && (
        <ActivityIndicator
          style={{ marginTop: 28 }}
          size="small"
          color="#2EC4C9"
        />
      )}
    </View>
  );
}

//
// ----------------------------------------------------------
//    🔥 PERFECT SVG VERSION OF THE LOGO FROM YOUR IMAGE
// ----------------------------------------------------------
//
function SLogo() {
  return (
    <Svg width={150} height={150} viewBox="0 0 512 512">
      {/* Top Folded Shape */}
      <Path
        d="
          M160 140
          L300 140
          L345 180
          L220 180
          L160 255
          Z
        "
        fill="#6AD7F5"
      />

      {/* Middle Shadow Shape */}
      <Path
        d="
          M220 180
          L300 140
          L345 180
          L295 260
          Z
        "
        fill="#1B6FA5"
      />

      {/* Bottom Shape */}
      <Path
        d="
          M150 300
          L290 300
          L255 380
          L210 380
          L180 350
          Z
        "
        fill="#47C3E8"
      />
    </Svg>
  );
}

//
// ----------------------------------------------------------
//                        STYLES
// ----------------------------------------------------------
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B2C33',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  title: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  tagline: {
    marginTop: 8,
    color: '#B6DDE4',
    textAlign: 'center',
    maxWidth: 320,
    fontSize: 14,
    lineHeight: 20,
  },

  offlineTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },

  offlineText: {
    marginTop: 10,
    color: '#B6DDE4',
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 20,
  },

  retryBtn: {
    marginTop: 28,
    backgroundColor: '#2EC4C9',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 28,
  },

  retryText: {
    color: '#05363F',
    fontWeight: '700',
    fontSize: 15,
  },
});
