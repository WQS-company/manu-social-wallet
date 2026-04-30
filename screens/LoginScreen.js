import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from '../api/axios';

const COLORS = {
  bg: '#021B48',
  blueLight: '#6AD7F5',
  blueMid: '#47C3E8',
  blueDeep: '#1B6FA5',
  white: '#FFFFFF',
};

export default function LoginScreen({ navigation }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Validation', 'Please enter email/phone and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('?action=login', { identifier, password });

      if (res.data?.token) {
        await AsyncStorage.setItem('token', res.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(res.data.user));

        navigation.replace('MainApp');
      } else {
        Alert.alert('Login failed', 'Invalid server response.');
      }
    } catch (err) {
      Alert.alert(
        'Login failed',
        err.response?.data?.error || 'Network or server error.'
      );
    } finally {
      setLoading(false);
    }
  };

  const onForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <View style={styles.container}>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={26} color={COLORS.blueLight} />
      </TouchableOpacity>

      {/* Titles */}
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Login to continue</Text>

      {/* Identifier */}
      <TextInput
        placeholder="Email or Phone number"
        placeholderTextColor={COLORS.blueLight + "90"}
        style={styles.input}
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Password */}
      <View style={styles.passwordWrap}>
        <TextInput
          placeholder="Password"
          placeholderTextColor={COLORS.blueLight + "90"}
          style={styles.passwordInput}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.eyeBtn}
          onPress={() => setShowPassword(!showPassword)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color={COLORS.blueLight}
          />
        </TouchableOpacity>
      </View>

      {/* Forgot Password */}
      <TouchableOpacity
        onPress={onForgotPassword}
        style={styles.forgotPasswordBtn}
        activeOpacity={0.7}
      >
        <Text style={styles.forgotPasswordTxt}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={onLogin}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.primaryTxt}>Login</Text>
        )}
      </TouchableOpacity>

      {/* Register */}
      <TouchableOpacity
        style={{ marginTop: 16 }}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.link}>
          Don’t have an account? Create one
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },

  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white + '22',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.blueLight,
    marginTop: 8,
    marginBottom: 28,
    textAlign: 'center',
    fontSize: 15,
  },

  input: {
    backgroundColor: COLORS.white + '10',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.blueLight + '40',
    marginBottom: 14,
    fontSize: 15,
    color: COLORS.white,
  },

  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white + '10',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.blueLight + '40',
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.white,
  },
  eyeBtn: {
    paddingLeft: 8,
  },

  forgotPasswordBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordTxt: {
    color: COLORS.blueLight,
    fontWeight: '600',
  },

  primaryBtn: {
    backgroundColor: COLORS.blueMid,
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryTxt: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },

  link: {
    color: COLORS.blueLight,
    fontWeight: '600',
    textAlign: 'center',
  },
});
