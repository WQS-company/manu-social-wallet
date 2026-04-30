// ================================
// RegisterScreen.js (FULL FILE)
// ================================
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "../api/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

export default function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [referrerId, setReferrerId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!firstName || !lastName || !email || !phone || !password || !bankCode) {
      Alert.alert("Missing fields", "All fields including bank are required.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        firstName,
        lastName,
        email,
        phone,
        password,
        bankCode,
        referrer_id: referrerId ? parseInt(referrerId) : 0,
      };

      const res = await axios.post("/api.php?action=register", payload, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("REGISTER RESPONSE:", res.data);

      if (res.data.error) {
        Alert.alert("Error", res.data.error);
        setLoading(false);
        return;
      }

      const { token, user, wallet_response } = res.data;

      // Save token + user
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("wallet_response", JSON.stringify(wallet_response));

      setLoading(false);

      Alert.alert("Success", "Registration successful!", [
        {
          text: "Continue",
          onPress: () => navigation.replace("MainApp"),
        },
      ]);
    } catch (err) {
      console.log("REGISTER ERROR:", err?.response?.data || err);
      Alert.alert(
        "Registration failed",
        err?.response?.data?.error || "Network/Server error"
      );
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Back Icon */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
         <Ionicons name="chevron-back" size={26} color="#0c43c2ff" />
      </TouchableOpacity>

      <Text style={styles.header}>Create Your Account</Text>

      {/* First Name */}
      <View style={styles.inputBox}>
        <Ionicons name="person-outline" size={20} color="#555" />
        <TextInput
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
        />
      </View>

      {/* Last Name */}
      <View style={styles.inputBox}>
        <Ionicons name="person" size={20} color="#555" />
        <TextInput
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
        />
      </View>

      {/* Email */}
      <View style={styles.inputBox}>
        <Ionicons name="mail-outline" size={20} color="#555" />
        <TextInput
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
        />
      </View>

      {/* Phone */}
      <View style={styles.inputBox}>
        <Ionicons name="call-outline" size={20} color="#555" />
        <TextInput
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          keyboardType="phone-pad"
        />
      </View>

      {/* Password */}
      <View style={styles.inputBox}>
        <Ionicons name="lock-closed-outline" size={20} color="#555" />
        <TextInput
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={{ paddingHorizontal: 5 }}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color="#444"
          />
        </TouchableOpacity>
      </View>

      {/* Bank Picker */}
      <View style={[styles.inputBox, { paddingVertical: 0 }]}>
        <Ionicons name="card-outline" size={20} color="#555" style={{ marginTop: 15 }} />
        <Picker
          selectedValue={bankCode}
          onValueChange={(itemValue) => setBankCode(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="-- Choose Bank --" value="" />
          <Picker.Item label="Wema Bank" value="035" />
          <Picker.Item label="Sterling Bank" value="232" />
          <Picker.Item label="Moniepoint MFB" value="090360" />
        </Picker>
      </View>

      {/* Referrer ID */}
      <View style={styles.inputBox}>
        <Ionicons name="gift-outline" size={20} color="#555" />
        <TextInput
          placeholder="Referrer ID (optional)"
          value={referrerId}
          onChangeText={setReferrerId}
          style={styles.input}
          keyboardType="numeric"
        />
      </View>

      {/* Register Button */}
      <TouchableOpacity
        style={styles.btn}
        onPress={onRegister}
        disabled={loading}
      >
        <Text style={styles.btnText}>
          {loading ? "Creating Account..." : "Register"}
        </Text>
      </TouchableOpacity>

      {/* Login Link */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Login")}
        style={{ marginTop: 20 }}
      >
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ======================
// STYLES
// ======================
const styles = StyleSheet.create({
  container: {
    padding: 25,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  backBtn: {
    marginBottom: 10,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
    marginBottom: 25,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  picker: {
    flex: 1,
    marginLeft: 8,
    marginTop: 10,
    fontSize: 16,
  },
  btn: {
    backgroundColor: "#1B6FA5",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  link: {
    textAlign: "center",
    fontSize: 16,
    color: "#1B6FA5",
  },
});
