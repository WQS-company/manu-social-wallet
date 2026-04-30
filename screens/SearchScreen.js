import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');

  return (
    <View style={styles.container}>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
         <Ionicons name="chevron-back" size={26} color="#0c43c2ff" />
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <TextInput
            placeholder="Search..."
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            autoFocus
            placeholderTextColor="#94A3B8"
          />
        </View>

        <TouchableOpacity>
          <Ionicons name="search-outline" size={22} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ===== RECENT ===== */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Item */}
        <RecentItem
          name="Sarkin Sharhi Doka"
          subtitle="Sarkin Sharhi shared a post 17h ago"
          image="https://i.pravatar.cc/100?img=1"
        />

        <RecentItem
          name="Isiyaku Abba"
          subtitle="Isiyaku posted a video 3h ago"
          image="https://i.pravatar.cc/100?img=2"
        />

        <RecentItem
          name="MatesLink"
          image="https://i.pravatar.cc/100?img=3"
        />

        <RecentItem
          name="tiger sub"
          image="https://i.pravatar.cc/100?img=4"
        />

        <RecentItem
          name="Sahara Reporters"
          subtitle="Nigeria Withdraws Deployed..."
          image="https://i.pravatar.cc/100?img=5"
          verified
        />

        {/* ===== BIRTHDAYS ===== */}
        <View style={styles.birthdayItem}>
          <Ionicons name="gift-outline" size={26} color="#10B981" />
          <Text style={styles.birthdayText}>1 birthday today</Text>
        </View>

        {/* ===== PEOPLE YOU MAY KNOW ===== */}
        <Text style={styles.sectionTitle}>People you may know</Text>

        <View style={styles.peopleRow}>
          <PersonCard image="https://i.pravatar.cc/150?img=10" />
          <PersonCard image="https://i.pravatar.cc/150?img=11" />
        </View>
      </ScrollView>
    </View>
  );
}

/* ===== COMPONENTS ===== */

function RecentItem({ name, subtitle, image, verified }) {
  return (
    <View style={styles.recentItem}>
      <Image source={{ uri: image }} style={styles.avatar} />

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.name}>{name}</Text>
          {verified && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color="#3B82F6"
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <Ionicons name="ellipsis-horizontal" size={18} color="#64748B" />
    </View>
  );
}

function PersonCard({ image }) {
  return (
    <View style={styles.personCard}>
      <Image source={{ uri: image }} style={styles.personImage} />
    </View>
  );
}

/* ===== STYLES ===== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  searchBox: {
    flex: 1,
    marginHorizontal: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 14,
  },

  searchInput: {
    height: 40,
    fontSize: 14,
    color: '#1E293B',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginVertical: 12,
  },

  seeAll: {
    color: '#2563EB',
    fontWeight: '600',
  },

  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 2,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },

  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },

  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  birthdayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 14,
    borderRadius: 16,
    marginTop: 16,
  },

  birthdayText: {
    marginLeft: 10,
    fontWeight: '600',
    color: '#065F46',
  },

  peopleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  personCard: {
    width: '48%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },

  personImage: {
    width: '100%',
    height: '100%',
  },
});
