import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const PIN_LENGTH = 4;

export default function SetPayoutPinScreen({ navigation }) {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);

  const pinInputRef = useRef(null);

  const SERVER_URL =
    "https://riyawacontractors.com/supportmanu/api/withdraw_server.php";

  // ✅ Auto-focus reliably
  useEffect(() => {
    const timer = setTimeout(() => {
      pinInputRef.current?.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // ✅ Clean + stable input handler
  const handlePinChange = (value) => {
    const cleaned = value.replace(/\D/g, "").slice(0, PIN_LENGTH);
    setPin(cleaned);
  };

  // ✅ Submit PIN
  const submitPin = async () => {
    if (pin.length !== PIN_LENGTH) {
      Alert.alert("Invalid PIN", "Payout PIN must be exactly 4 digits.");
      return;
    }

    try {
      const raw = await AsyncStorage.getItem("user");
      const user = JSON.parse(raw);

      const res = await axios.post(SERVER_URL, {
        action: "set_pin",
        user_id: user?.id,
        pin,
      });

      if (res.data.status === "success") {
        Keyboard.dismiss();
        Alert.alert("Success", "Payout PIN created successfully.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert("Error", res.data.message || "Failed to set PIN.");
      }
    } catch {
      Alert.alert("Network Error", "Unable to reach the server.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        {/* BACK */}
        <TouchableOpacity style={styles.backBtn} onPress={navigation.goBack}>
          <Ionicons name="chevron-back" size={28} color="#c20c33ff" />
        </TouchableOpacity>

        <Text style={styles.title}>Create Payout PIN</Text>
        <Text style={styles.desc}>
          This PIN will be required for all withdrawals.
        </Text>

        {/* PIN INPUT */}
        <View style={styles.inputWrapper}>
          <TextInput
            ref={pinInputRef}
            value={pin}
            onChangeText={handlePinChange}
            keyboardType="number-pad"
            secureTextEntry={!showPin}
            maxLength={PIN_LENGTH}
            placeholder="••••"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            returnKeyType="done"
          />

          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPin((p) => !p)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPin ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          PIN must be 4 digits. Do not share it with anyone.
        </Text>

        {/* BUTTON */}
        <TouchableOpacity style={styles.button} onPress={submitPin}>
          <Text style={styles.buttonText}>Set Payout PIN</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: "#F8FAFC",
  },

  backBtn: {
    marginBottom: 20,
  },

  title: {
    fontSize: 23,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },

  desc: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 30,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    paddingHorizontal: 16,
    height: 60,
  },

  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: 12, // premium PIN look
  },

  eyeBtn: {
    paddingLeft: 12,
  },

  hint: {
    marginTop: 10,
    fontSize: 12,
    color: "#64748B",
  },

  button: {
    marginTop: 30,
    backgroundColor: "#1D4ED8",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
