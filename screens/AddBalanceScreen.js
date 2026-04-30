import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ LOCAL FALLBACK IMAGE
const DEFAULT_USER_IMAGE = require('../assets/default-user.png');

export default function AddBalanceScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [user, setUser] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const raw = await AsyncStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    };
    loadUser();
  }, []);

  return (
    <View style={styles.container}>

      {/* BACK */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={26} color="#0c43c2ff" />
      </TouchableOpacity>

      {/* USER INFO */}
      <View style={styles.userCard}>
        <Image
          source={
            imageError || !user?.image_url
              ? DEFAULT_USER_IMAGE
              : { uri: user.image_url }
          }
          style={styles.avatar}
          onError={() => setImageError(true)}
        />
        <View>
          <Text style={styles.name}>
            {user ? `${user.first_name} ${user.last_name}` : 'User'}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      <Text style={styles.header}>Add Balance</Text>

      <Text style={styles.label}>Enter Amount</Text>

      <TextInput
        style={styles.input}
        placeholder="₦0.00"
        keyboardType="numeric"
        value={amount}
        onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ''))}
      />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20
  },

  backBtn: {
    marginBottom: 18
  },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 25,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
    backgroundColor: '#E5E7EB'
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },

  email: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },

  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 25
  },

  label: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8
  },

  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },

  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },

  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  }
});
