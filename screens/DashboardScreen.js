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
import Video from "react-native-video";
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
        </View>
      </View>
    </View>
  </View>
  <View style={styles.postBody}>
    <Text style={styles.postText}>{item.text}</Text>
    {/* IMAGE / VIDEO (AUTO-DETECT) */}
{item.media && item.media.length > 0 && (
  <View style={styles.mediaContainer}>
    {item.media.map((m, index) => {
      const isVideo =
        m.type?.toLowerCase() === "video" ||
        m.url?.toLowerCase().endsWith(".mp4"); // fallback

      return isVideo ? (
        <Video
          key={index}
          source={{ uri: m.url }}
          style={styles.media}
          resizeMode="cover"
          controls
          paused={false} // auto-play; set to true if you want paused initially
        />
      ) : (
        <Image
          key={index}
          source={{ uri: m.url }}
          style={styles.media}
          resizeMode="cover"
        />
      );
    })}
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
  const API_URL = "https://riyawacontractors.com/supportmanu/api/get_help_requests.php";

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
              style={[
                styles.categoryPill,
                active && styles.categoryPillActive,
              ]}
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
        keyExtractor={(p) => String(p.id)}
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
          <View>
            <PostCard
              item={item}
              onSupport={onSupport}
              onComment={onComment}
              onShare={onShare}
            />
          </View>
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
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },

  container: {
    flex: 1,
    padding: 0,
    backgroundColor: "#020617",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  /* ---------- TOP HEADER ---------- */
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#020617",
    borderBottomWidth: 1,
    borderBottomColor: "#0f172a",
  },

  greetingBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 12,
  },

  greetingText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F8FAFC",
  },

  searchBtn: { paddingLeft: 12 },

  iconBtn: { marginRight: 10 },

  dot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    backgroundColor: "#EF4444",
    borderRadius: 4,
  },

  avatarMini: {
    width: 36,
    height: 36,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  /* ---------- CATEGORY ---------- */
  categoryWrapper: {
    paddingVertical: 12,
    paddingLeft: 16,
    backgroundColor: "#020617",
  },

  categoryPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#020617",
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  categoryPillActive: {
    backgroundColor: "#2563EB33",
    borderColor: "#2563EB",
  },

  categoryText: {
    color: "#CBD5F5",
    fontWeight: "600",
  },

  categoryTextActive: {
    color: "#60A5FA",
  },

  /* ---------- POST CARD ---------- */
  postCard: {
    backgroundColor: "#020617",
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#0f172a",
  },

  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },

  avatarHolder: {
    width: 58,
    height: 58,
    justifyContent: "center",
    alignItems: "center",
  },

  ringRotate: {
    position: "absolute",
    width: 58,
    height: 58,
    borderRadius: 58,
    borderWidth: 3,
    borderColor: "#EF4444",
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },

  postAuthor: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F8FAFC",
  },

  postMeta: {
    fontSize: 12,
    color: "#94A3B8",
  },

  categoryTag: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: "#E5E7EB",
    overflow: "hidden",
  },

  /* ---------- BODY ---------- */
  postBody: {
    marginTop: 6,
  },

  postText: {
    color: "#E5E7EB",
    lineHeight: 22,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  /* ---------- TIKTOK STYLE MEDIA ---------- */
  mediaContainer: {
    width: "100%",
    height: 420,
    backgroundColor: "#000",
    flexDirection: "row",
  },

  media: {
    width: width,
    height: "100%",
    backgroundColor: "#000",
  },

  /* ---------- ACTIONS ---------- */
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: "#020617",
  },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionText: {
    marginLeft: 8,
    color: "#CBD5F5",
    fontWeight: "600",
  },

  supportLineWrapper: {
    height: 4,
    marginTop: 6,
    overflow: "hidden",
  },

  supportLine: {
    height: 2,
    backgroundColor: "#3B82F6",
    borderRadius: 4,
  },

  /* ---------- DROPDOWN ---------- */
  smallMenu: {
    position: "absolute",
    top: 70,
    right: 10,
    backgroundColor: "#020617",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
    width: 120,
    zIndex: 200,
  },

  logoutBtnSmall: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutTextSmall: {
    marginLeft: 6,
    fontWeight: "700",
    color: "#EF4444",
  },
});
