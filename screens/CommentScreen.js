import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const DUMMY_COMMENTS = [
  { id: "c1", author: "Aisha", text: "I will help, sending details." },
  { id: "c2", author: "Chinedu", text: "Shared to my network." },
];

export default function CommentScreen({ route, navigation }) {
  const { post } = route.params;
  const [comments, setComments] = useState(DUMMY_COMMENTS);
  const [text, setText] = useState("");

  const addComment = () => {
    if (!text.trim()) return;
    setComments([
      { id: Date.now().toString(), author: "You", text },
      ...comments,
    ]);
    setText("");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
             <Ionicons name="chevron-back" size={26} color="#0c43c2ff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comments</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* POST PREVIEW */}
        <View style={styles.postPreview}>
          <Image source={{ uri: post.avatar }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.author}>{post.author}</Text>
            <Text style={styles.meta}>
              {post.time} • {post.category}
            </Text>
            <Text style={styles.postText}>{post.text}</Text>
          </View>
        </View>

        {/* COMMENTS */}
        <FlatList
          data={comments}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={styles.commentItem}>
              <View style={styles.commentAvatar}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  {item.author[0]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700" }}>{item.author}</Text>
                <Text>{item.text}</Text>
              </View>
            </View>
          )}
        />

        {/* INPUT */}
        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Write a comment…"
            style={styles.input}
          />
          <TouchableOpacity onPress={addComment} style={styles.sendBtn}>
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F8FAFC" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  headerTitle: { fontSize: 18, fontWeight: "700" },

  postPreview: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },

  avatar: { width: 44, height: 44, borderRadius: 44, marginRight: 12 },

  author: { fontWeight: "700" },
  meta: { fontSize: 12, color: "#64748B" },
  postText: { marginTop: 6 },

  commentItem: {
    flexDirection: "row",
    
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: "#1E90FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  input: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
  },

  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#1E90FF",
    padding: 12,
    borderRadius: 10,
  },
});
