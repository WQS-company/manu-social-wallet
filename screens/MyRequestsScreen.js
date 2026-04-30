import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEFAULT_USER_IMAGE = require("../assets/default-user.png");

export default function MyRequestsScreen() {
  const [user, setUser] = useState(null);
  const [imageError, setImageError] = useState(false);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(1);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 10;

  useEffect(() => {
    AsyncStorage.getItem("user").then((data) => {
      if (data) {
        const parsed = JSON.parse(data);
        setUser(parsed);
        fetchRequests(1, parsed.id);
      }
    });
  }, []);

  const fetchRequests = async (pageNumber, userId) => {
    try {
      if (pageNumber === 1) setLoading(true);

      const res = await axios.get(
        `https://riyawacontractors.com/supportmanu/api/get_user_requests.php`,
        {
          params: {
            user_id: userId,
            page: pageNumber,
            limit: LIMIT,
          },
        }
      );

      const newData = res.data.requests || [];

      if (pageNumber === 1) {
        setRequests(newData);
      } else {
        setRequests((prev) => [...prev, ...newData]);
      }

      setHasMore(newData.length === LIMIT);
    } catch (err) {
      console.log("Fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setFetchingMore(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    if (user) fetchRequests(1, user.id);
  }, [user]);

  const loadMore = () => {
    if (fetchingMore || !hasMore) return;

    setFetchingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRequests(nextPage, user.id);
  };

  const renderRequest = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDesc} numberOfLines={3}>
        {item.description}
      </Text>

      <Text style={styles.category}>Category: {item.category}</Text>

      <Text style={styles.status}>
        Status:{" "}
        <Text
          style={{
            color: item.status === "approved" ? "green" : "#d97706",
            fontWeight: "700",
          }}
        >
          {item.status}
        </Text>
      </Text>

      {/* Show media thumbnails */}
      {item.media.length > 0 && (
        <View style={styles.mediaContainer}>
          {item.media.map((m, index) => (
            <Image
              key={index}
              source={{ uri: m.file_path }}
              style={styles.media}
            />
          ))}
        </View>
      )}

      <Text style={styles.date}>{item.created_at}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* User Card */}
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
          <Text style={styles.name}>
            {user ? `${user.first_name} ${user.last_name}` : "User"}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>
      <Text style={styles.title}>My Requests</Text>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id.toString()}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            fetchingMore ? (
              <ActivityIndicator size="small" style={{ marginVertical: 15 }} />
            ) : null
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              You have not made any requests yet.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F5F7FA" },

  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 20,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },

  name: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  email: { fontSize: 13, color: "#64748B", marginTop: 2 },
  userId: { fontSize: 14, fontWeight: "600", marginBottom: 5 },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E90FF",
    marginBottom: 12,
  },

  loaderWrap: {
    marginTop: 40,
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  cardTitle: { fontSize: 17, fontWeight: "700", color: "#1e293b" },
  cardDesc: { color: "#475569", marginVertical: 6 },
  category: { fontSize: 14, color: "#2563eb", marginTop: 5 },

  status: { fontSize: 14, marginTop: 5 },

  date: { fontSize: 12, color: "#94a3b8", marginTop: 10 },

  mediaContainer: {
    flexDirection: "row",
    marginTop: 10,
  },

  media: {
    width: 70,
    height: 70,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },

  emptyText: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 16,
    color: "#64748B",
  },
});
