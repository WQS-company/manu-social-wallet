import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

// ✅ LOCAL FALLBACK IMAGE
const DEFAULT_USER_IMAGE = require('../assets/default-user.png');

export default function NotificationsScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('user').then(data => {
      if (data) setUser(JSON.parse(data));
    });
  }, []);

  const notifications = [
    {
      id: '1',
      title: 'Wallet Credited',
      message: '₦25,000 has been added to your wallet successfully.',
      time: '2 min ago',
      icon: 'wallet-outline',
      color: '#16A34A',
      unread: true,
    },
    {
      id: '2',
      title: 'Withdrawal Processing',
      message: 'Your withdrawal request of ₦10,000 is being processed.',
      time: '1 hour ago',
      icon: 'swap-horizontal-outline',
      color: '#2563EB',
      unread: true,
    },
    {
      id: '3',
      title: 'Security Alert',
      message: 'New login detected from a new device.',
      time: 'Yesterday',
      icon: 'shield-checkmark-outline',
      color: '#DC2626',
      unread: false,
    },
    {
      id: '4',
      title: 'Profile Updated',
      message: 'Your profile information was updated successfully.',
      time: '2 days ago',
      icon: 'person-outline',
      color: '#7C3AED',
      unread: false,
    },
    {
      id: '5',
      title: 'System Update',
      message: 'We’ve improved app performance and fixed bugs.',
      time: 'Last week',
      icon: 'information-circle-outline',
      color: '#0EA5E9',
      unread: false,
    },
  ];

  const renderItem = ({ item }) => (
    <View style={[styles.notificationCard, item.unread && styles.unread]}>
      <View style={[styles.iconWrap, { backgroundColor: item.color + '15' }]}>
        <Ionicons name={item.icon} size={22} color={item.color} />
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.row}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>

        <Text style={styles.message}>{item.message}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color="#0c43c2ff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* User Card */}
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

      {/* Notifications */}
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },

  /* User Card */
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
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

  /* Notifications */
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  time: {
    fontSize: 12,
    color: '#94A3B8',
  },
  message: {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
    lineHeight: 18,
  },
});
