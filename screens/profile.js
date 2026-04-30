// ProfileScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Clipboard from '@react-native-clipboard/clipboard';
import NetInfo from '@react-native-community/netinfo';

// Default user image
import DefaultUserImage from '../assets/default-user.png';

// Server API to fetch wallet info
const SERVER_URL = 'https://riyawacontractors.ng/supportmanu/api/get_wallet_info.php';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load user from AsyncStorage
  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const raw = await AsyncStorage.getItem('user');
        if (!mounted) return;

        if (raw) {
          const parsed = JSON.parse(raw);
          setUser(parsed);

          if (parsed?.id) {
            fetchWalletForUser(parsed.id);
          }
        }
      } catch (err) {
        console.warn("Couldn't load user", err);
      }
    };

    loadUser();
    return () => { mounted = false; };
  }, []);

  // Fetch wallet info
  const fetchWalletForUser = useCallback(async (userId) => {
    try {
      if (!userId) return;

      setLoadingWallet(true);

      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        setLoadingWallet(false);
        Alert.alert('No Internet', 'Please check your internet connection.');
        return;
      }

      const url = `${SERVER_URL}?user_id=${encodeURIComponent(userId)}`;
      const res = await fetch(url);

      if (!res.ok) {
        setLoadingWallet(false);
        return;
      }

      const json = await res.json();

      if (json?.status === 'success') {
        const acc = json.account || {};
        setWallet({
          balance_raw: json.balance_raw || 0,
          balance: json.balance ?? `₦${parseFloat(json.balance_raw || 0).toFixed(2)}`,
          currency: json.currency ?? 'NGN',
          account_reference: acc.account_reference || null,
          account_name: acc.account_name || null,
          bank_code: acc.bank_code || null,
          bank_name: acc.bank_name || null,
          nuban: acc.nuban || null,
          status: acc.status || null,
        });
      } else {
        setWallet(null);
      }
    } catch (err) {
      console.warn("Wallet fetch failed", err);
    } finally {
      setLoadingWallet(false);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id) await fetchWalletForUser(user.id);
    setRefreshing(false);
  };

  const copyAccountNumber = () => {
    if (!wallet?.nuban) {
      Alert.alert("No account", "You don’t have wallet account details");
      return;
    }

    Clipboard.setString(String(wallet.nuban));
    Alert.alert("Copied", "Account number copied");
  };

  const displayedBalance = () => {
    if (loadingWallet) return <ActivityIndicator size="small" />;

    if (!wallet) {
      const fallback = user?.wallet_balance ? `₦${user.wallet_balance}` : '₦0.00';
      return showBalance ? fallback : '•••••••';
    }

    return showBalance ? wallet.balance : '•••••••';
  };

  const hasAccountDetails = wallet?.bank_name && wallet?.nuban && wallet?.account_name;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={user?.avatar ? { uri: user.avatar } : DefaultUserImage}
          style={styles.avatar}
        />
        <Text style={styles.name}>
          {user ? `${user.first_name} ${user.last_name}` : 'User'}
        </Text>
        <Text style={styles.email}>{user?.email || 'guest@example.com'}</Text>
      </View>

      {/* WALLET CARD */}
      <View style={styles.card}>
        <ProfileRow
          icon="wallet-outline"
          label="Wallet Balance"
          value={displayedBalance()}
          actionIcon={showBalance ? 'eye-outline' : 'eye-off-outline'}
          onActionPress={() => setShowBalance(!showBalance)}
        />

        {hasAccountDetails ? (
          <>
            <ProfileRow icon="business-outline" label="Bank" value={wallet.bank_name} />
            <ProfileRow
              icon="card-outline"
              label="Account Number"
              value={wallet.nuban}
              onActionPress={copyAccountNumber}
              actionIcon="copy-outline"
            />
            <ProfileRow icon="person-circle-outline" label="Account Name" value={wallet.account_name} />
          </>
        ) : (
          <TouchableOpacity
            style={styles.generateBtn}
            onPress={() => navigation.navigate('GenerateWallet')}
          >
            <Ionicons name="flash-outline" size={20} color="#fff" />
            <Text style={styles.generateBtnText}>Generate Wallet Account</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* EDIT PROFILE BUTTON */}
      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => navigation.navigate('EditProfile')}
      >
        <Ionicons name="create-outline" size={18} color="#FFF" />
        <Text style={styles.editText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* REUSABLE ROW */
function ProfileRow({ icon, label, value, actionIcon, onActionPress }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={22} color="#2563EB" />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      {actionIcon && onActionPress && (
        <TouchableOpacity onPress={onActionPress}>
          <Ionicons name={actionIcon} size={20} color="#2563EB" />
        </TouchableOpacity>
      )}
    </View>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  header: { alignItems: 'center', marginTop: 10, marginBottom: 25 },
  avatar: { width: 110, height: 110, borderRadius: 55, marginBottom: 12 },
  name: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  email: { fontSize: 14, color: '#64748B', marginTop: 4 },
  card: { borderRadius: 16, padding: 16, backgroundColor: '#fff', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  label: { fontSize: 12, color: '#64748B' },
  value: { fontSize: 15, fontWeight: '600', color: '#0f172a', marginTop: 2 },
  editBtn: {
    marginTop: 10,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editText: { color: '#FFF', marginLeft: 8, fontWeight: '700', fontSize: 15 },
  generateBtn: {
    marginTop: 20,
    backgroundColor: '#0c43c2ff',
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateBtnText: { color: '#fff', marginLeft: 8, fontSize: 15, fontWeight: '600' },
});
