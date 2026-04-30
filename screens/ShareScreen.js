// ShareScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ShareScreen({ route, navigation }) {
  const post = route.params?.post;

  const doShare = (channel) => {
    // Dummy share: replace with real share integration later
    Alert.alert('Shared', `Post shared via ${channel}`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#0c43c2ff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Share {post?.author}'s request</Text>
        <Text style={styles.meta}>{post?.category} · {post?.time}</Text>

        <TouchableOpacity style={styles.shareBtn} onPress={() => doShare('WhatsApp')}>
          <Ionicons name="logo-whatsapp" size={20} />
          <Text style={styles.shareText}>Share to WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareBtn} onPress={() => doShare('Feed')}>
          <Ionicons name="share-social" size={20} />
          <Text style={styles.shareText}>Share to Feed</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareBtn} onPress={() => doShare('Link')}>
          <Ionicons name="link-outline" size={20} />
          <Text style={styles.shareText}>Copy Link</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: '700' },

  card: {  padding: 16, borderRadius: 14 },
  title: { fontSize: 16, fontWeight: '700' },
  meta: { color: '#64748B', marginTop: 6, marginBottom: 12 },

  shareBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  shareText: { marginLeft: 12, fontWeight: '600' },
});
