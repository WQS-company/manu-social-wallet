import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from '../api/axios';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email) {
      Alert.alert('Validation', 'Please enter your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('?action=forgot_password', { email });

      if (res.data?.success) {
        Alert.alert(
          'Success',
          'Password reset link has been sent to your email.'
        );
        setEmail('');
      } else {
        Alert.alert(
          'Failed',
          res.data?.message || 'Unable to process your request.'
        );
      }
    } catch (err) {
      Alert.alert(
        'Error',
        err.response?.data?.error || 'Network or server error.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={26} color="#0F172A" />
      </TouchableOpacity>

      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        Enter your registered email to reset your password
      </Text>

      <TextInput
        placeholder="Email address"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={onSubmit}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryTxt}>Send Reset Link</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    backgroundColor: '#E5E7EB20',
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },

  subtitle: {
    color: '#64748B',
    marginTop: 8,
    marginBottom: 28,
    textAlign: 'center',
  },

  input: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
    fontSize: 15,
    color: '#0F172A',
  },

  primaryBtn: {
    backgroundColor: '#1B6FA5',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryTxt: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
