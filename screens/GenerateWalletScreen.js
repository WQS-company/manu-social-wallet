import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";

const API_URL = "https://riyawacontractors.ng/supportmanu/api/create_wallet.php";

export default function GenerateWalletScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const generateWallet = async () => {
    const raw = await AsyncStorage.getItem("user");
    const user = JSON.parse(raw);

    if (!user?.id) {
      Alert.alert("Error", "User not found");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });

      const json = await res.json();

      if (json.status === "success") {
        Alert.alert("Success", "Wallet generated successfully");
        navigation.goBack();
      } else {
        Alert.alert("Error", json.message || "Failed to generate wallet");
      }
    } catch (e) {
      Alert.alert("Network Error", "Please check your internet connection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* BACK ICON */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={26} color="#2563EB" />
      </TouchableOpacity>

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.title}>Generate Wallet</Text>

        <Text style={styles.desc}>
          You currently don’t have a wallet account.
          Generate your wallet to receive support payments and manage your balance.
        </Text>

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.7 }]}
          onPress={generateWallet}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.btnText}>Generate Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 24,
    paddingTop: 40
  },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30
  },

  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
    marginLeft: 2
  },

  content: {
    flex: 1,
    justifyContent: "center"
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12
  },

  desc: {
    fontSize: 15,
    color: "#475569",
    marginBottom: 30,
    lineHeight: 22
  },

  btn: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center"
  },

  btnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16
  }
});
