// ===================== SupportScreen.js =====================
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import NetInfo from '@react-native-community/netinfo';

// ✅ LOCAL DEFAULT IMAGE
const DEFAULT_USER_IMAGE = require('../assets/default-user.png');

// ✅ WALLET SERVER
const SERVER_URL = 'https://riyawacontractors.com/supportmanu/api/get_wallet_info.php';

export default function SupportScreen({ route, navigation }) {
  const post = route.params?.post;

  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [imageError, setImageError] = useState(false);

  /* ---------------- LOAD USER ---------------- */
  useEffect(() => {
    const loadUser = async () => {
      const raw = await AsyncStorage.getItem('user');
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);

        if (parsed?.id) {
          fetchWallet(parsed.id);
        }
      }
    };
    loadUser();
  }, []);

  /* ---------------- FETCH WALLET INFO ---------------- */
  const fetchWallet = async (userId) => {
    try {
      setLoadingWallet(true);

      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        setLoadingWallet(false);
        Alert.alert('No Internet', 'Please check your connection.');
        return;
      }

      const res = await fetch(`${SERVER_URL}?user_id=${userId}`);
      const json = await res.json();

      if (json?.status === 'success' && json?.account) {
        setWallet({
          bank: json.account.bank_name,
          nuban: json.account.nuban,
          name: json.account.account_name,
        });
      } else {
        setWallet(null);
      }
    } catch (e) {
      console.warn('Wallet fetch error', e);
      Alert.alert('Error', 'Failed to load wallet info.');
    } finally {
      setLoadingWallet(false);
    }
  };

  /* ---------------- PULL TO REFRESH ---------------- */
  const onRefresh = useCallback(() => {
    if (!user?.id) return;
    setRefreshing(true);
    fetchWallet(user.id).finally(() => setRefreshing(false));
  }, [user]);

  /* ---------------- COPY ACCOUNT NUMBER ---------------- */
  const copyAccount = () => {
    if (!wallet?.nuban) {
      Alert.alert('No account', 'Wallet account not available');
      return;
    }
    Clipboard.setString(String(wallet.nuban));
    Alert.alert('Copied', 'Account number copied');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F8FAFC' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={26} color="#0c43c2ff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Support</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* USER CARD */}
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
            <Text style={styles.userName}>
              {user ? `${user.first_name} ${user.last_name}` : 'User'}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* SUPPORT CARD */}
        <View style={styles.card}>
          <Text style={styles.title}>{post?.author}</Text>
          <Text style={styles.meta}>
            {post?.category} · {post?.time}
          </Text>
          <Text style={styles.desc}>{post?.text}</Text>
        </View>

        {/* ACCOUNT DETAILS */}
        <View style={styles.accountCard}>
          <Text style={styles.sectionTitle}>Wallet Account Details</Text>

          {!wallet ? (
            <Text style={styles.noAccountText}>
              No wallet account details available
            </Text>
          ) : (
            <>
              <View style={styles.accountRow}>
                <Ionicons name="business-outline" size={20} color="#475569" />
                <View style={styles.accountInfo}>
                  <Text style={styles.accountLabel}>Bank</Text>
                  <Text style={styles.accountValue}>{wallet.bank}</Text>
                </View>
              </View>

              <View style={[styles.accountRow, { justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row' }}>
                  <Ionicons name="card-outline" size={20} color="#475569" />
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountLabel}>Account Number</Text>
                    <Text style={styles.accountValue}>{wallet.nuban}</Text>
                  </View>
                </View>

                <TouchableOpacity onPress={copyAccount}>
                  <Ionicons name="copy-outline" size={20} color="#2563EB" />
                </TouchableOpacity>
              </View>

              <View style={styles.accountRow}>
                <Ionicons name="person-circle-outline" size={20} color="#475569" />
                <View style={styles.accountInfo}>
                  <Text style={styles.accountLabel}>Account Name</Text>
                  <Text style={styles.accountValue}>{wallet.name}</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* WHITE TRANSPARENT LOADER OVERLAY */}
      <Modal transparent visible={loadingWallet}>
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loaderText}>Loading Wallet Info...</Text>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: '#F8FAFC',
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  userName: {
    fontWeight: '700',
    fontSize: 15,
    color: '#0F172A',
  },
  userEmail: {
    color: '#64748B',
    fontSize: 12,
  },

  card: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#fff',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  meta: {
    color: '#64748B',
    marginTop: 4,
    fontSize: 12,
  },
  desc: {
    marginTop: 10,
    color: '#0F172A',
    lineHeight: 20,
    fontSize: 14,
  },

  accountCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  noAccountText: {
    textAlign: 'center',
    color: '#64748B',
  },
  accountRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'center',
  },
  accountInfo: {
    marginLeft: 12,
  },
  accountLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  accountValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },

  loaderOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#fff',
    marginTop: 12,
    fontWeight: '600',
    fontSize: 14,
  },
});
