import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import default user image from project folder
import DefaultUserImage from '../assets/default-user.png';

export default function EditProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('user').then(data => {
      if (data) setUser(JSON.parse(data));
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* USER CARD */}
      <View style={styles.userCard}>
        <Image
          source={user?.avatar ? { uri: user.avatar } : DefaultUserImage}
          style={styles.avatar}
        />

        <View>
          <Text style={styles.name}>
            {user ? `${user.first_name} ${user.last_name}` : 'User'}
          </Text>
          <Text style={styles.email}>{user?.email || 'guest@example.com'}</Text>
        </View>
      </View>

      {/* CONTENT PLACEHOLDER */}
      <View style={styles.content}>
        <Text style={styles.placeholderTitle}>Profile Information</Text>
        <Text style={styles.placeholderText}>
          You can edit your personal details on this page.
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A'
  },

  /* USER CARD */
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A'
  },
  email: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2
  },

  /* CONTENT */
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 10
  },
  placeholderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6
  },
  placeholderText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18
  }
});
