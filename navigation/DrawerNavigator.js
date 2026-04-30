// DrawerNavigator.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Clipboard from '@react-native-clipboard/clipboard';
import NetInfo from '@react-native-community/netinfo';
// Import your screens
import BottomTabs from './BottomTabs';
import EditProfileScreen from '../screens/EditProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';
import AddBalanceScreen from '../screens/AddBalanceScreen';
import WithdrawScreen from '../screens/WithdrawScreen';
import GenerateWalletScreen from '../screens/GenerateWalletScreen';
// DEFAULT USER IMAGE
import DefaultUserImg from '../assets/default-user.png';
const Drawer = createDrawerNavigator();
// Your server URL
const SERVER_URL = 'https://riyawacontractors.com/supportmanu/api/get_wallet_info.php';
function CustomDrawerContent(props) {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const data = await AsyncStorage.getItem('user');
        if (!mounted) return;

        if (data) {
          const parsed = JSON.parse(data);
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

  const fetchWalletForUser = useCallback(async (userId) => {
    try {
      if (!userId) return;

      setLoadingWallet(true);

      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        setLoadingWallet(false);
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
          status: acc.status || null
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
    if (user?.id) {
      await fetchWalletForUser(user.id);
    }
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
    if (loadingWallet) {
      return <ActivityIndicator size="small" />;
    }

    if (!wallet) {
      const fallback = user?.wallet_balance ? `₦${user.wallet_balance}` : '₦0.00';
      return showBalance ? fallback : '•••••••';
    }

    return showBalance ? wallet.balance : '•••••••';
  };

  const hasAccountDetails =
    wallet?.bank_name &&
    wallet?.nuban &&
    wallet?.account_name;

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => props.navigation.closeDrawer()}>
        <Ionicons name="chevron-back" size={26} color="#0c43c2ff" />
      </TouchableOpacity>

      {/* USER BOX */}
      <View style={styles.userBox}>
        <Image source={DefaultUserImg} style={styles.drawerAvatar} />

        {user ? (
          <>
            <Text style={styles.drawerName}>
              {user.first_name} {user.last_name}
            </Text>
            <Text style={styles.drawerEmail}>{user.email}</Text>
            <Text style={styles.drawerPhone}>{user.phone}</Text>
          </>
        ) : (
          <Text style={styles.drawerEmail}>Not signed in</Text>
        )}
      </View>

      {/* ----------- NO WALLET BOX ----------- */}
      {!hasAccountDetails && (
        <View style={styles.noWalletBox}>
          <Text style={styles.noWalletText}>You don’t have wallet account details</Text>

          {/* UPDATED → TAKE USER TO GenerateWalletScreen */}
          <TouchableOpacity
            style={styles.generateBtn}
            onPress={() => props.navigation.navigate('GenerateWallet')}
          >
            <Ionicons name="flash-outline" size={20} color="#fff" />
            <Text style={styles.generateBtnText}>Generate Wallet Account</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* -------- WALLET DETAILS -------- */}
      {hasAccountDetails && (
        <View style={styles.walletCard}>
          <View style={styles.walletHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="wallet-outline" size={24} color="#2563EB" />
              <Text style={styles.walletTitle}>Wallet Balance</Text>
            </View>

            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
              <Ionicons
                name={showBalance ? 'eye-outline' : 'eye-off-outline'}
                size={24}
                color="#475569"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.walletAmount}>{displayedBalance()}</Text>
          <Text style={styles.walletSub}>Available Balance</Text>

          <View style={styles.walletButtonsRow}>
            <TouchableOpacity
              style={[styles.walletButton, { marginRight: 10 }]}
              onPress={() => props.navigation.navigate('AddBalance')}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFF" />
              <Text style={styles.walletButtonText}>Add Balance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.walletButton, { backgroundColor: '#F97316', marginLeft: 10 }]}
              onPress={() => props.navigation.navigate('Withdraw')}
            >
              <Ionicons name="arrow-up-circle-outline" size={20} color="#FFF" />
              <Text style={styles.walletButtonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* --------- ACCOUNT DETAILS --------- */}
      <View style={styles.accountCard}>
        <Text style={styles.sectionHeader}>Account Details</Text>

        {!hasAccountDetails ? (
          <Text style={{ textAlign: 'center', color: '#64748B', marginTop: 10 }}>
            You don’t have wallet account details
          </Text>
        ) : (
          <>
            {/* BANK */}
            <View style={styles.accountRow}>
              <Ionicons name="business-outline" size={20} color="#475569" />
              <View style={styles.accountInfo}>
                <Text style={styles.accountLabel}>Bank</Text>
                <Text style={styles.accountValue}>{wallet.bank_name}</Text>
              </View>
            </View>

            {/* ACCOUNT NUMBER */}
            <View style={[styles.accountRow, { justifyContent: 'space-between', alignItems: 'center' }]}>
              <View style={{ flexDirection: 'row' }}>
                <Ionicons name="card-outline" size={20} color="#475569" />
                <View style={styles.accountInfo}>
                  <Text style={styles.accountLabel}>Account Number</Text>
                  <Text style={styles.accountValue}>{wallet.nuban}</Text>
                </View>
              </View>

              <TouchableOpacity onPress={copyAccountNumber}>
                <Ionicons name="copy-outline" size={20} color="#2563EB" />
              </TouchableOpacity>
            </View>

            {/* ACCOUNT NAME */}
            <View style={styles.accountRow}>
              <Ionicons name="person-circle-outline" size={20} color="#475569" />
              <View style={styles.accountInfo}>
                <Text style={styles.accountLabel}>Account Name</Text>
                <Text style={styles.accountValue}>{wallet.account_name}</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* DRAWER MENUS */}
      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => props.navigation.navigate('EditProfile')}
      >
        <Ionicons name="person-outline" size={20} color="#1E90FF" />
        <Text style={styles.drawerText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => props.navigation.navigate('Notifications')}
      >
        <Ionicons name="notifications-outline" size={20} color="#1E90FF" />
        <Text style={styles.drawerText}>Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => props.navigation.navigate('HelpCenter')}
      >
        <Ionicons name="help-circle-outline" size={20} color="#1E90FF" />
        <Text style={styles.drawerText}>Help Center</Text>
      </TouchableOpacity>

    </DrawerContentScrollView>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: { width: '100%' }
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="HomeTabs" component={BottomTabs} />
      <Drawer.Screen name="AddBalance" component={AddBalanceScreen} />
      <Drawer.Screen name="Withdraw" component={WithdrawScreen} />
      <Drawer.Screen name="EditProfile" component={EditProfileScreen} />
      <Drawer.Screen name="Notifications" component={NotificationsScreen} />
      <Drawer.Screen name="HelpCenter" component={HelpCenterScreen} />

      {/* NEW — Generate Wallet Screen */}
      <Drawer.Screen name="GenerateWallet" component={GenerateWalletScreen} />
    </Drawer.Navigator>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  drawerContainer: {
    flexGrow: 1,
    minHeight: '100%',
    backgroundColor: '#F8FAFC',
    paddingTop: 30,
    paddingBottom: 50
  },
  backBtn: {
    paddingLeft: 20,
    marginBottom: 20
  },
  userBox: {
    alignItems: 'center',
    marginBottom: 25
  },
  drawerAvatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
    marginBottom: 10
  },
  drawerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B'
  },
  drawerEmail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4
  },
  drawerPhone: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2
  },
  noWalletBox: {
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 22,
    backgroundColor: '#f1f5f9'
  },
  noWalletText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600'
  },
  generateBtn: {
    marginTop: 18,
    backgroundColor: '#0c43c2ff',
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  generateBtnText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600'
  },
  walletCard: {
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 22
  },
  walletHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  walletTitle: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600'
  },
  walletAmount: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 15
  },
  walletSub: {
    color: '#64748B',
    fontSize: 13
  },
  walletButtonsRow: {
    flexDirection: 'row',
    marginTop: 20
  },
  walletButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  walletButtonText: {
    color: '#FFF',
    marginLeft: 6,
    fontWeight: '600'
  },
  accountCard: {
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 25
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 15
  },
  accountRow: {
    flexDirection: 'row',
    marginBottom: 15
  },
  accountInfo: {
    marginLeft: 12
  },
  accountLabel: {
    fontSize: 12,
    color: '#64748B'
  },
  accountValue: {
    fontSize: 15,
    fontWeight: '600'
  },
  drawerItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 25
  },
  drawerText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#1E293B'
  }
});
