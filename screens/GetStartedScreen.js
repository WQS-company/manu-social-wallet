// screens/GetStartedScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// -------------------------
// ⭐ COLORS FROM YOUR LOGO
// -------------------------
const COLORS = {
  bg: '#021B48',
  blueLight: '#6AD7F5',
  blueMid: '#47C3E8',
  blueDeep: '#1B6FA5',
  white: '#FFFFFF'
};

export default function GetStartedScreen({ navigation }) {
  const stars = Array.from({ length: 40 }).map(() => ({
    x: Math.random() * width,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 3000,
    duration: 4000 + Math.random() * 4000
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* ⭐ Animated Starfield */}
      {stars.map((star, i) => (
        <FloatingStar key={i} {...star} />
      ))}

      {/* 🔥 Branding Block */}
      <View style={styles.logoBox}>
        <SLogo />
      </View>

      {/* TEXT */}
      <Text style={styles.title}>Welcome to Support Menu</Text>
      <Text style={styles.subtitle}>
        A trusted space to request help or offer support.
      </Text>

      {/* 🔹 Create Account */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.primaryTxt}>Create Account</Text>
      </TouchableOpacity>

      {/* 🔸 Login */}
      <TouchableOpacity
        style={styles.outlineBtn}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.outlineTxt}>Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// --------------------------------------------
// ⭐ Animated Floating Star Component
// --------------------------------------------
function FloatingStar({ x, size, delay, duration }) {
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(height);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -50,
          duration,
          delay,
          useNativeDriver: true
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true
          })
        ])
      ]).start(() => animate());
    };

    animate();
  }, []);

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: COLORS.blueLight,
        position: 'absolute',
        left: x,
        transform: [{ translateY }],
        opacity
      }}
    />
  );
}

// --------------------------------------------
// ⭐ YOUR PREMIUM S-LOGO (Exact Colors)
// --------------------------------------------
function SLogo() {
  return (
    <Svg width={110} height={110} viewBox="0 0 512 512">
      {/* Top Fold */}
      <Path
        d="
          M160 140
          L300 140
          L345 180
          L220 180
          L160 255
          Z
        "
        fill={COLORS.blueLight}
      />

      {/* Middle Shadow */}
      <Path
        d="
          M220 180
          L300 140
          L345 180
          L295 260
          Z
        "
        fill={COLORS.blueDeep}
      />

      {/* Bottom Fold */}
      <Path
        d="
          M150 300
          L290 300
          L255 380
          L210 380
          L180 350
          Z
        "
        fill={COLORS.blueMid}
      />
    </Svg>
  );
}

// --------------------------------------------
// ⭐ STYLES
// --------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    padding: 24,
    justifyContent: 'center'
  },

  logoBox: {
    width: 150,
    height: 150,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },

  title: {
    fontSize: 26,
    color: COLORS.white,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8
  },

  subtitle: {
    color: '#AFC4D9',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 32,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 300
  },

  primaryBtn: {
    width: '100%',
    maxWidth: 360,
    padding: 15,
    borderRadius: 14,
    backgroundColor: COLORS.blueMid,
    alignItems: 'center',
    marginBottom: 14
  },

  primaryTxt: {
    color: COLORS.bg,
    fontWeight: '700',
    fontSize: 15
  },

  outlineBtn: {
    width: '100%',
    maxWidth: 360,
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.blueMid
  },

  outlineTxt: {
    color: COLORS.blueMid,
    fontWeight: '700',
    fontSize: 15
  }
});
