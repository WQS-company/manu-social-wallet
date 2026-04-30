import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import Video from "react-native-video";
import Ionicons from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get("window");
const CARD_RADIUS = 18;

/* ---------------- MEDIA DATA ---------------- */
const MEDIA_DATA = [
  {
    id: "1",
    type: "image",
    title: "Modern Clinic Interior",
    caption:
      "A calm and modern healthcare environment designed to improve patient comfort and recovery experience.",
    author: "Ma'aliq Health",
    time: "2 hours ago",
    source: "https://picsum.photos/600/400?random=11",
  },
  {
    id: "2",
    type: "video",
    title: "Healthcare Awareness Video",
    caption:
      "Watch this short awareness video on maintaining a healthy lifestyle and preventing common diseases.",
    views: "5k",
    author: "Health Media",
    time: "5 hours ago",
    source:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    id: "3",
    type: "image",
    title: "Medical Equipment",
    caption:
      "Advanced medical equipment ensures accurate diagnosis and better patient outcomes.",
    author: "Clinic Admin",
    time: "Yesterday",
    source: "https://picsum.photos/600/400?random=12",
  },
  {
    id: "4",
    type: "video",
    title: "Hospital Environment",
    caption:
      "A clean and organized hospital environment is essential for quality healthcare delivery.",
    views: "2.3k",
    author: "Hospital TV",
    time: "2 days ago",
    source:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  },
];

/* ---------------- SCREEN ---------------- */
export default function MediaFeedScreen() {
  const [activeVideo, setActiveVideo] = useState(null);
  const videoRefs = useRef({});

  /* --------- AUTO PLAY ON SCROLL --------- */
  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    const visibleVideo = viewableItems.find(
      (v) => v.item.type === "video"
    );

    if (visibleVideo) {
      setActiveVideo(visibleVideo.item.id);
    } else {
      setActiveVideo(null);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 70,
  };

  const togglePlay = (id) => {
    setActiveVideo((prev) => (prev === id ? null : id));
  };

  const renderItem = ({ item }) => {
    const isPlaying = activeVideo === item.id;

    return (
      <View style={styles.card}>
        {/* ---------- HEADER ---------- */}
        <View style={styles.headerRow}>
          <View style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.author}>{item.author}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          <Ionicons name="ellipsis-vertical" size={18} color="#94a3b8" />
        </View>

        {/* ---------- TITLE ---------- */}
        <Text style={styles.title}>{item.title}</Text>

        {/* ---------- IMAGE ---------- */}
        {item.type === "image" && (
          <Image source={{ uri: item.source }} style={styles.media} />
        )}

        {/* ---------- VIDEO ---------- */}
        {item.type === "video" && (
          <View style={styles.videoWrapper}>
            <Video
              ref={(ref) => (videoRefs.current[item.id] = ref)}
              source={{ uri: item.source }}
              style={styles.media}
              paused={!isPlaying}
              resizeMode="cover"
              controls
              fullscreenAutorotate
              fullscreenOrientation="landscape"
            />
            {/* CENTER PLAY */}
            {!isPlaying && (
              <TouchableOpacity
                style={styles.centerPlay}
                onPress={() => togglePlay(item.id)}
              >
              </TouchableOpacity>
            )}
          </View>
        )}
        {/* ---------- ACTIONS ---------- */}
        <View style={styles.actionsRow}>
          <ActionItem icon="heart-outline" label="Like" />
          <ActionItem icon="chatbubble-outline" label="Comment" />
          <ActionItem icon="share-social-outline" label="Share" />
          <ActionItem icon="bookmark-outline" label="Save" />
        </View>
        {/* ---------- CAPTION ---------- */}
        <Text style={styles.caption}>
          <Text style={styles.captionAuthor}>{item.author} </Text>
          {item.caption}
        </Text>

        {/* ---------- SOCIAL STATS (VIDEO ONLY) ---------- */}
        {item.type === "video" && (
          <View style={styles.socialRow}>
            <Text style={styles.socialText}>{item.views} views</Text>

            <View style={styles.percentRow}>
              <Ionicons name="thumbs-up" color="#22c55e" size={16} />
              <Text style={styles.percentText}>80%</Text>

              <Ionicons
                name="thumbs-down"
                color="#ef4444"
                size={16}
                style={{ marginLeft: 10 }}
              />
              <Text style={styles.percentText}>20%</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={MEDIA_DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
    </View>
  );
}

/* ---------------- ACTION ITEM ---------------- */
const ActionItem = ({ icon, label }) => (
  <TouchableOpacity style={styles.actionItem}>
    <Ionicons name={icon} size={20} color="#e5e7eb" />
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);
/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },

  card: {
    marginBottom: 32,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#334155",
    marginRight: 10,
  },

  author: {
    color: "#e5e7eb",
    fontWeight: "700",
    fontSize: 14,
  },

  time: {
    color: "#94a3b8",
    fontSize: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 10,
  },

  media: {
    width: width - 40,
    height: 230,
    borderRadius: CARD_RADIUS,
    backgroundColor: "#000",
  },

  videoWrapper: {
    position: "relative",
  },

  topBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  topBadgeText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "700",
  },

  centerPlay: {
    position: "absolute",
    top: "40%",
    left: "45%",
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  actionItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionText: {
    color: "#e5e7eb",
    marginLeft: 6,
    fontSize: 13,
  },

  caption: {
    color: "#cbd5f5",
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },

  captionAuthor: {
    fontWeight: "700",
    color: "#e5e7eb",
  },

  socialRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  socialText: {
    color: "#94a3b8",
    fontSize: 13,
  },

  percentRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  percentText: {
    color: "#e5e7eb",
    fontSize: 12,
    marginLeft: 4,
  },
}); 