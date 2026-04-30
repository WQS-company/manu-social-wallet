// DashboardScreen.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  FlatList,
  Animated,
  Dimensions,
  Pressable,
  Alert,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";
import Clipboard from "@react-native-clipboard/clipboard";

// Import default user image
import DefaultUser from "../assets/default-user.png"; // adjust path to your project

const { width } = Dimensions.get("window");

const CATEGORY_LIST = ["All", "Medical", "Education", "Business", "Other"];

// ---- PostCard component (keeps your animations & UI) ----
function PostCard({ item, onSupport, onComment, onShare }) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const supportLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (item.urgent) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [item.urgent, rotateAnim]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(supportLineAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: false,
        }),
        Animated.timing(supportLineAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [supportLineAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const lineWidth = supportLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["20%", "95%"],
  });

  const lineOpacity = supportLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const copyAccountNumber = (nuban) => {
    if (!nuban) {
      Alert.alert("No Account", "This post doesn't have an account number.");
      return;
    }
    try {
      Clipboard.setString(nuban);
      Alert.alert("Copied", "Account number copied to clipboard.");
    } catch (e) {
      console.warn("Clipboard error", e);
      Alert.alert("Error", "Failed to copy account number.");
    }
  };

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {item.urgent ? (
            <View style={{ marginRight: 12 }}>
              <View style={styles.avatarHolder}>
                <Animated.View
                  style={[styles.ringRotate, { transform: [{ rotate: spin }] }]}
                />
                <Image
                  source={item.avatar ? { uri: item.avatar } : DefaultUser}
                  style={styles.avatar}
                />
              </View>
            </View>
          ) : (
            <Image
              source={item.avatar ? { uri: item.avatar } : DefaultUser}
              style={[styles.avatar, { marginRight: 12 }]}
            />
          )}

          <View style={{ flex: 1 }}>
            <Text style={styles.postAuthor}>{item.author}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
              <Text style={styles.postMeta}>{item.time}</Text>
              <Text style={{ marginHorizontal: 6, color: "#64748B" }}>•</Text>
              <Text style={styles.categoryTag}>{item.category}</Text>
              {/* Wallet/account summary (small) */}
              {item.wallet && (
                <View style={{ marginLeft: 8 }}>
                  <Text style={{ fontSize: 12, color: "#334155", marginTop: 4 }}>
                    {item.wallet.account_name ?? ""} {item.wallet.bank_name ? `• ${item.wallet.bank_name}` : ""}
                  </Text>
                  {item.wallet.nuban ? (
                    <Text style={{ fontSize: 12, color: "#475569" }}>{item.wallet.nuban}</Text>
                  ) : null}
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.postBody}>
        <Text style={styles.postText}>{item.text}</Text>

        {/* show any images (first image preview) */}
        {item.media && item.media.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Image
              source={{ uri: item.media[0].file_path }}
              style={{ width: "100%", height: 180, borderRadius: 10 }}
              resizeMode="cover"
            />
          </View>
        )}

        {/* ACCOUNT DETAILS - Option A (Professional Card below the post) */}
        {item.wallet && (
          <View style={styles.accountBox}>
            <Text style={styles.accountTitle}>Account Details</Text>

            <Text style={styles.accLine}>
              <Text style={styles.accLabel}>Bank: </Text>
              <Text style={styles.accValue}>{item.wallet.bank_name ?? "N/A"}</Text>
            </Text>

            <Text style={styles.accLine}>
              <Text style={styles.accLabel}>Account Name: </Text>
              <Text style={styles.accValue}>{item.wallet.account_name ?? "N/A"}</Text>
            </Text>

            <View style={styles.accRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.accLine}>
                  <Text style={styles.accLabel}>Account Number: </Text>
                  <Text style={styles.accValue}>{item.wallet.nuban ?? "N/A"}</Text>
                </Text>
              </View>

              {item.wallet.nuban ? (
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => copyAccountNumber(item.wallet.nuban)}
                >
                  <Ionicons name="copy-outline" size={16} color="#0f172a" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}
      </View>

      <View style={styles.postActions}>
        <View>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onSupport(item)}
          >
            <Ionicons name="heart-outline" size={20} />
            <Text style={styles.actionText}>Support</Text>
          </TouchableOpacity>

          <View style={styles.supportLineWrapper}>
            <Animated.View
              style={[
                styles.supportLine,
                { width: lineWidth, opacity: lineOpacity },
              ]}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onComment(item)}
        >
          <Ionicons name="chatbubble-outline" size={20} />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onShare(item)}
        >
          <Ionicons name="share-social-outline" size={20} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---- DashboardScreen component ----
export default function DashboardScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // replace with your actual API endpoint
  const API_URL = "https://riyawacontractors.ng/supportmanu/api/get_help_requests.php";

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const raw = await AsyncStorage.getItem("user");
        if (raw && mounted) setUser(JSON.parse(raw));
      } catch (e) {
        console.warn("Failed to load user from AsyncStorage", e);
      } finally {
        if (mounted) setLoadingUser(false);
      }
    };

    loadUser();
    fetchPosts(); // fetch posts on mount
    return () => (mounted = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeCategory === "All") setFilteredPosts(posts);
    else setFilteredPosts(posts.filter((p) => (p.category || "").toLowerCase() === activeCategory.toLowerCase()));
  }, [activeCategory, posts]);

  const timeAgo = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000); // seconds
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
    if (diff < 60 * 60 * 24 * 7) return `${Math.floor(diff / 86400)} days ago`;
    return d.toDateString();
  };

  async function fetchPosts() {
    setLoadingPosts(true);
    try {
      const res = await axios.get(API_URL, { timeout: 15000 });
      if (res.data && res.data.success) {
        const postsFromApi = (res.data.posts || []).map((p) => {
          const authorName = `${p.user?.first_name ?? ""} ${p.user?.last_name ?? ""}`.trim() || "Unknown";
          return {
            id: String(p.id ?? p.request_id),
            author: authorName,
            avatar: p.user?.avatar ?? null,
            time: timeAgo(p.created_at),
            category: p.category || "Other",
            text: p.description || p.title || "",
            urgent: Number(p.is_urgent || 0) === 1,
            media: p.media || [],
            wallet: p.wallet || null,
            raw: p // attach raw for navigation if needed
          };
        });
        setPosts(postsFromApi);
        setFilteredPosts(postsFromApi);
      } else {
        // API returned failure
        const msg = (res.data && res.data.message) ? res.data.message : "Failed to fetch posts";
        console.warn("API error:", msg);
        Alert.alert("Error", msg);
      }
    } catch (err) {
      console.warn("Fetch posts error", err);
      Alert.alert("Network Error", "Unable to fetch posts. Check your API URL and CORS settings.");
    } finally {
      setLoadingPosts(false);
      setRefreshing(false);
    }
  }

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const onSupport = (post) => navigation.navigate("Support", { post });
  const onComment = (post) => navigation.navigate("Comments", { post });
  const onShare = (post) => navigation.navigate("Share", { post });

  if (loadingUser) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu-sharp" size={28} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.greetingBox}>
          <Text style={styles.greetingText}>
            Hi, {user?.first_name ?? "Friend"}
          </Text>
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => navigation.navigate("Search")}
          >
            <Ionicons name="search-outline" size={22} color="#1E293B" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate("Notifications")}
        >
          <Ionicons name="notifications-outline" size={24} color="#1E293B" />
          <View style={styles.dot} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
          <Image
            source={user?.avatar ? { uri: user.avatar } : DefaultUser}
            style={styles.avatarMini}
          />
        </TouchableOpacity>
      </View>

      {showMenu && (
        <Pressable style={styles.overlay} onPress={() => setShowMenu(false)}>
          <View style={styles.smallMenu}>
            <TouchableOpacity
              style={styles.logoutBtnSmall}
              onPress={() => {
                AsyncStorage.clear();
                navigation.replace("GetStarted");
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.logoutTextSmall}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      )}

      <View style={styles.categoryWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORY_LIST}
          keyExtractor={(i) => i}
          renderItem={({ item }) => {
            const active = item === activeCategory;
            return (
              <TouchableOpacity
                style={[styles.categoryPill, active && styles.categoryPillActive]}
                onPress={() => setActiveCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    active && styles.categoryTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loadingPosts ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#1E90FF" />
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(p) => p.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#1E90FF"
              colors={["#1E90FF"]}
            />
          }
          renderItem={({ item }) => (
            <PostCard
              item={item}
              onSupport={onSupport}
              onComment={onComment}
              onShare={onShare}
            />
          )}
          ListEmptyComponent={() => (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: "#64748B" }}>No requests found.</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

// Styles remain unchanged (kept from your original file) with added account styles
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 18, backgroundColor: "#F8FAFC" },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  topHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  greetingBox: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 12 },
  greetingText: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  searchBtn: { paddingLeft: 12 },
  iconBtn: { marginRight: 10 },
  dot: { position: "absolute", top: 2, right: 2, width: 8, height: 8, backgroundColor: "#EF4444", borderRadius: 4 },
  avatarMini: { width: 36, height: 36, borderRadius: 50 },
  smallMenu: { position: "absolute", top: 70, right: 10, backgroundColor: "#fff", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, elevation: 10, width: 120, zIndex: 200 },
  logoutBtnSmall: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  logoutTextSmall: { marginLeft: 6, fontWeight: "700", color: "#EF4444" },
  categoryWrapper: { marginTop: 10, marginBottom: 14 },
  categoryPill: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: "#fff", marginRight: 10, borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0" },
  categoryPillActive: { backgroundColor: "#1E90FF22", borderColor: "#1E90FF" },
  categoryText: { color: "#1E293B", fontWeight: "600" },
  categoryTextActive: { color: "#1E90FF" },
  postCard: { backgroundColor: "#fff", padding: 16, marginBottom: 12, borderRadius: 12, borderColor: "#E2E8F0", borderWidth: 1 },
  postHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  avatarHolder: { width: 58, height: 58, justifyContent: "center", alignItems: "center" },
  ringRotate: { position: "absolute", width: 58, height: 58, borderRadius: 58, borderWidth: 3, borderColor: "#b86464ff", borderLeftColor: "transparent", borderBottomColor: "transparent" },
  avatar: { width: 50, height: 50, borderRadius: 50 },
  postAuthor: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  postMeta: { fontSize: 12, color: "#64748B" },
  categoryTag: { backgroundColor: "#EEF2FF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 12, color: "#1E293B" },
  postBody: { marginTop: 12 },
  postText: { color: "#0f172a", lineHeight: 20 },
  // Account details styles
  accountBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FAFBFF",
    borderWidth: 1,
    borderColor: "#E6EEF9",
  },
  accountTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  accLine: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 6,
  },
  accLabel: {
    fontWeight: "700",
    color: "#1E293B"
  },
  accValue: {
    fontWeight: "600",
    color: "#0f172a"
  },
  accRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  copyBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#E6EEF9",
    marginLeft: 10,
  },
  postActions: { marginTop: 14, flexDirection: "row", justifyContent: "space-between" },
  actionBtn: { flexDirection: "row", alignItems: "center" },
  actionText: { marginLeft: 8, color: "#1E293B", fontWeight: "600" },
  supportLineWrapper: { height: 4, marginTop: 6, overflow: "hidden" },
  supportLine: { height: 2, backgroundColor: "#1E90FF", borderRadius: 4 },
});
