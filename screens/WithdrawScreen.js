// ==================== WithdrawScreen.js ====================
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
  Easing,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Dropdown } from 'react-native-element-dropdown';

// Default local image
const DEFAULT_USER_IMAGE = require('../assets/default-user.png');
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function WithdrawScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);

  // BANK STATES
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null); // bank_code
  const [selectedBankName, setSelectedBankName] = useState('');

  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(true);

  // PIN
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinInputs, setPinInputs] = useState(['', '', '', '']);
  const pinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const [imageError, setImageError] = useState(false);

  const SERVER_URL =
    'https://riyawacontractors.com/supportmanu/api/withdraw_server.php';

  // Animation refs for modal slide and overlays
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current; // translateY
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const spinnerOpacity = useRef(new Animated.Value(0)).current;

  // Success tick overlay
  const [successVisible, setSuccessVisible] = useState(false);
  const successScale = useRef(new Animated.Value(0.5)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  // Processing (transparent spinner) separate from general loading
  const [processing, setProcessing] = useState(false);

  // ==================== LOAD USER ====================
  useEffect(() => {
    const loadUser = async () => {
      const raw = await AsyncStorage.getItem('user');
      if (!raw) {
        Alert.alert('Not signed in', 'Please login first');
        return;
      }

      const u = JSON.parse(raw);
      setUser(u);
      fetchWallet(u.id);
      fetchBanks();
    };

    loadUser();
  }, []);

  // ==================== FETCH WALLET ====================
  const fetchWallet = async (userId) => {
    try {
      setLoading(true);
      const res = await axios.get(SERVER_URL, { params: { user_id: userId } });

      if (res.data?.status === 'success') {
        setWallet(res.data.wallet || null);
        setBalance(parseFloat(res.data.balance || 0));
      }
    } catch {
      Alert.alert('Error', 'Could not load wallet');
    } finally {
      setLoading(false);
    }
  };

  // ==================== FETCH BANKS ====================
  const fetchBanks = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}?action=get_banks`);

      if (res.data?.status === 'success' && Array.isArray(res.data.data)) {
        const formatted = res.data.data.map((b) => ({
          label: b.name || b.bank_name,
          value: b.code || b.bank_code,
        }));
        setBanks(formatted);
      } else {
        setBanks([]);
      }
    } catch {
      setBanks([]);
    } finally {
      setLoadingBanks(false);
    }
  };

  // ==================== VERIFY ACCOUNT ====================
  const verifyAccount = async (accNumber, bankCode) => {
    if (!accNumber || accNumber.length !== 10 || !bankCode) return;

    try {
      const res = await axios.post(SERVER_URL, {
        action: 'verify_account',
        account_number: accNumber,
        bank_code: bankCode,
        user_id: user?.id
      });

      if (res.data?.status === 'success') {
        setAccountName(res.data.data?.account_name || '');
      } else {
        setAccountName('');
      }
    } catch {
      setAccountName('');
    }
  };

  // ==================== HANDLE WITHDRAW ====================
  const handleWithdraw = async () => {
    // validation
    if (!selectedBank) {
      Alert.alert('Error', 'Please select a bank');
      return;
    }

    if (accountNumber.length !== 10) {
      Alert.alert('Error', 'Enter a valid 10-digit account number');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Enter a valid amount');
      return;
    }

    try {
      const pinCheck = await axios.post(SERVER_URL, {
        action: 'check_pin',
        user_id: user?.id
      });

      if (pinCheck.data.status === 'no_pin') {
        Alert.alert('Payout PIN Required', 'Please set a PIN first.', [
          { text: 'Set PIN', onPress: () => navigation.navigate('SetPayoutPinScreen') }
        ]);
        return;
      }
    } catch {
      Alert.alert('Error', 'Cannot verify PIN');
      return;
    }

    // Show PIN modal immediately and animate it in.
    openPinModalImmediate();
  };

  // ==================== OPEN PIN MODAL WITH SLIDE-UP ANIMATION ====================
  const openPinModalImmediate = () => {
    // Reset inputs and show modal
    setPinInputs(['', '', '', '']);
    setPinModalVisible(true);

    // run overlay fade in + slide up
    overlayOpacity.setValue(0);
    slideAnim.setValue(SCREEN_HEIGHT); // start below screen
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      })
    ]).start(() => {
      // focus first input right away for instant typing
      setTimeout(() => {
        try {
          pinRefs[0].current?.focus();
        } catch {}
      }, 50);
    });
  };

  // Close pin modal with slide down
  const closePinModal = (cb) => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic)
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic)
      })
    ]).start(() => {
      setPinModalVisible(false);
      if (typeof cb === 'function') cb();
    });
  };

  // ==================== SUBMIT WITHDRAW ====================
  const submitWithdraw = async () => {
    const pin = pinInputs.join('');
    if (!/^\d{4}$/.test(pin)) {
      Alert.alert('Error', 'Enter a valid 4-digit PIN');
      return;
    }

    try {
      // Verify PIN first
      const verifyRes = await axios.post(SERVER_URL, {
        action: 'verify_pin',
        pin,
        user_id: user?.id
      });

      if (verifyRes.data.status !== 'success') {
        Alert.alert('Incorrect PIN', 'Please try again');
        // clear inputs for security
        setPinInputs(['', '', '', '']);
        try {
          pinRefs[0].current?.focus();
        } catch {}
        return;
      }

      // Show processing overlay (transparent spinner)
      triggerProcessing(true);

      // Now submit withdraw
      const res = await axios.post(SERVER_URL, {
        action: 'withdraw',
        user_id: user?.id,
        account_number: accountNumber,
        bank_code: selectedBank,
        amount: parseFloat(amount),
        narration: narration || 'Wallet Withdrawal'
      });

      // hide processing
      triggerProcessing(false);

      if (res.data.status === 'success') {
        // Show success tick overlay then close modal and reset
        showSuccessThenReset();
      } else {
        Alert.alert('Error', res.data.message || 'Something went wrong');
      }
    } catch (err) {
      triggerProcessing(false);
      Alert.alert('Error', 'Server error');
    }
  };

  // ==================== PROCESSING OVERLAY (TRANSPARENT SPINNER) ====================
  const triggerProcessing = (on) => {
    if (on) {
      setProcessing(true);
      spinnerOpacity.setValue(0);
      Animated.timing(spinnerOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }).start();
    } else {
      Animated.timing(spinnerOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic)
      }).start(() => setProcessing(false));
    }
  };

  // ==================== SUCCESS TICK ====================
  const showSuccessThenReset = () => {
    // animate success
    setSuccessVisible(true);
    successScale.setValue(0.6);
    successOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }),
      Animated.spring(successScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 60
      })
    ]).start(() => {
      // keep for 1100ms then close
      setTimeout(() => {
        Animated.timing(successOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }).start(() => {
          setSuccessVisible(false);
          // reset form
          setSelectedBank(null);
          setSelectedBankName('');
          setAccountNumber('');
          setAccountName('');
          setAmount('');
          setNarration('');
          setPinInputs(['', '', '', '']);
          // close modal if open
          closePinModal(() => fetchWallet(user?.id));
        });
      }, 1100);
    });
  };

  // ==================== PIN INPUT HANDLING (including backspace) ====================
  const handlePinChange = (index, value) => {
    // accept only one digit numeric
    const v = value.replace(/\D/g, '').slice(0, 1);
    const arr = [...pinInputs];
    arr[index] = v;
    setPinInputs(arr);

    if (v) {
      // move forward automatically
      if (index < 3) {
        pinRefs[index + 1].current?.focus();
      } else {
        // last digit filled -> keep focus here
        pinRefs[index].current?.blur?.();
      }
    }
  };

  const handlePinKeyPress = (index, e) => {
    // handle Android/iOS backspace
    if (e.nativeEvent.key === 'Backspace') {
      if (pinInputs[index] === '') {
        // move to previous and clear
        if (index > 0) {
          const arr = [...pinInputs];
          arr[index - 1] = '';
          setPinInputs(arr);
          pinRefs[index - 1].current?.focus();
        }
      } else {
        // clear current
        const arr = [...pinInputs];
        arr[index] = '';
        setPinInputs(arr);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={26} color="#c20c33" />
      </TouchableOpacity>

      {/* USER CARD */}
      <View style={styles.userCard}>
        <Image
          source={
            imageError || !user?.image_url ? DEFAULT_USER_IMAGE : { uri: user.image_url }
          }
          onError={() => setImageError(true)}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.name}>{user?.first_name} {user?.last_name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      <Text style={styles.balance}>Balance: ₦{balance?.toFixed(2) ?? '0.00'}</Text>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* BANK DROPDOWN */}
        <Text style={styles.label}>Select Bank</Text>

        {loadingBanks ? (
          <ActivityIndicator color="#2563eb" />
        ) : (
          <Dropdown
            style={styles.dropdown}
            data={banks}
            labelField="label"
            valueField="value"
            search
            searchPlaceholder="Search bank..."
            placeholder="Choose bank"
            value={selectedBank}
            onChange={(item) => {
              setSelectedBank(item.value);
              setSelectedBankName(item.label);
              verifyAccount(accountNumber, item.value);
            }}
          />
        )}

        {/* ACCOUNT NUMBER */}
        <Text style={styles.label}>Account Number</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          maxLength={10}
          value={accountNumber}
          placeholder="Enter 10-digit number"
          onChangeText={(t) => {
            const clean = t.replace(/\D/g, '');
            setAccountNumber(clean);
            if (clean.length === 10 && selectedBank) {
              verifyAccount(clean, selectedBank);
            }
          }}
        />

        {accountName ? (
          <Text style={{ color: 'green', marginBottom: 10 }}>{accountName}</Text>
        ) : null}

        {/* AMOUNT */}
        <Text style={styles.label}>Amount (₦)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={amount}
          placeholder="Enter amount"
          onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))}
        />

        {/* NARRATION */}
        <Text style={styles.label}>Narration</Text>
        <TextInput
          style={styles.input}
          placeholder="Wallet withdrawal"
          value={narration}
          onChangeText={setNarration}
        />

        <TouchableOpacity style={styles.button} onPress={handleWithdraw}>
          <Text style={styles.buttonText}>Proceed</Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* PIN MODAL (animated slide from bottom) */}
      <Modal
        visible={pinModalVisible}
        transparent
        animationType="none"
        onRequestClose={() => {
          // close with animation
          closePinModal();
        }}
      >
        <TouchableWithoutFeedback onPress={() => { /* prevent closing on backdrop press */ }}>
          <View style={styles.modalRoot}>
            {/* animated semi-transparent backdrop */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.animatedBackdrop,
                {
                  opacity: overlayOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.6]
                  })
                }
              ]}
            />

            {/* Slide-up container */}
            <Animated.View
              style={[
                styles.pinModal,
                {
                  transform: [{ translateY: slideAnim }],
                }
              ]}
            >
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ width: '100%', alignItems: 'center' }}
              >
                <View style={styles.modalHandle} />
                <Text style={styles.pinTitle}>Confirm Transfer</Text>
                <Text style={styles.pinSubtitle}>
                  Enter your 4-digit payout PIN to confirm this transfer.
                </Text>

                <View style={styles.pinRow}>
                  {pinInputs.map((v, i) => (
                    <TextInput
                      key={i}
                      ref={pinRefs[i]}
                      style={styles.pinInput}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={v}
                      onChangeText={(t) => handlePinChange(i, t)}
                      onKeyPress={(e) => handlePinKeyPress(i, e)}
                      secureTextEntry
                      returnKeyType={i === 3 ? 'done' : 'next'}
                      textContentType="oneTimeCode"
                      accessible
                      accessibilityLabel={`PIN digit ${i + 1}`}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.button, { width: '100%', marginTop: 22 }]}
                  onPress={submitWithdraw}
                >
                  <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => closePinModal()}
                  style={{ marginTop: 14 }}
                >
                  <Text style={{ color: '#ef4444', fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
              </KeyboardAvoidingView>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Transparent processing spinner overlay */}
      {processing && (
        <Animated.View
          pointerEvents="auto"
          style={[
            styles.processingOverlay,
            { opacity: spinnerOpacity }
          ]}
        >
          <View style={styles.processingBox}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.processingText}>Processing transfer...</Text>
          </View>
        </Animated.View>
      )}

      {/* Success tick overlay */}
      {successVisible && (
        <View style={styles.successOverlayRoot} pointerEvents="none">
          <Animated.View
            style={[
              styles.successCircle,
              {
                transform: [{ scale: successScale }],
                opacity: successOpacity
              }
            ]}
          >
            <Ionicons name="checkmark" size={56} color="#fff" />
          </Animated.View>
        </View>
      )}

      {/* General loading fallback (keeps previous behavior) */}
      {loading && !processing && (
        <View style={styles.spinnerOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: '#fff', marginTop: 10 }}>Loading...</Text>
        </View>
      )}
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8FAFC' },
  backBtn: { marginBottom: 12 },

  userCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },

  avatar: { width: 52, height: 52, borderRadius: 26, marginRight: 12, resizeMode: 'cover' },

  name: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  email: { fontSize: 13, color: '#6B7280' },

  balance: { fontSize: 18, fontWeight: '800', color: '#059669', marginVertical: 12 },

  label: { fontSize: 14, marginTop: 14, marginBottom: 6, color: '#0F172A' },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    fontSize: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1
  },

  dropdown: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    backgroundColor: '#FFF',
    marginBottom: 6
  },

  button: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 18,
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3
  },

  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  // Modal/backdrop roots
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  animatedBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },

  // Pin modal styles (card)
  pinModal: {
    width: '100%',
    backgroundColor: '#fff',
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    paddingHorizontal: 20,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10
  },

  modalHandle: {
    width: 48,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 12
  },

  pinTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6, color: '#0F172A' },
  pinSubtitle: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 16, paddingHorizontal: 2 },

  pinRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 6 },

  pinInput: {
    width: 62,
    height: 62,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    marginHorizontal: 6,
    backgroundColor: '#FBFDFF',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2
  },

  spinnerOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center'
  },

  // processing overlay (transparent professional)
  processingOverlay: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    // background is slightly translucent but blurred feeling
  },
  processingBox: {
    width: 220,
    paddingVertical: 20,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8
  },
  processingText: { color: '#fff', marginTop: 12, fontWeight: '600' },

  // success overlay
  successOverlayRoot: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'transparent'
  },
  successCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 12
  },

});
