import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function HelpCenterScreen({ navigation }) {
  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
         <Ionicons name="chevron-back" size={26} color="#0c43c2ff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Help Center</Text>

        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        <Text style={styles.subtitle}>
          How can we help you today?
        </Text>

        {/* HELP ITEMS */}
        <View style={styles.card}>
          <Ionicons name="help-circle-outline" size={22} color="#2563EB" />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>FAQs</Text>
            <Text style={styles.cardDesc}>
              Find answers to common questions about your account and wallet.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Ionicons name="wallet-outline" size={22} color="#2563EB" />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Wallet Issues</Text>
            <Text style={styles.cardDesc}>
              Having trouble with balance, withdrawals, or payments?
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#2563EB" />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Account & Security</Text>
            <Text style={styles.cardDesc}>
              Learn how to secure your account and protect your data.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#2563EB" />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Contact Support</Text>
            <Text style={styles.cardDesc}>
              Reach out to our support team for personalized help.
            </Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF'
  },
  backBtn: {
    padding: 4
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A'
  },

  /* CONTENT */
  content: {
    padding: 20,
    paddingBottom: 40
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20
  },

  /* CARDS */
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2
  },
  cardText: {
    marginLeft: 12,
    flex: 1
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B'
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18
  }
});
