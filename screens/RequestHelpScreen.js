// ==================== RequestHelpScreen.js ====================
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  FlatList,
  Pressable,
  Alert,
  Platform,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Camera } from 'react-native-camera-kit';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

import DefaultUserImage from '../assets/default-user.png';

const { width, height } = Dimensions.get('window');

export default function RequestHelpScreen() {
  const [user, setUser] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [contactAddress, setContactAddress] = useState('');
  const [mediaList, setMediaList] = useState([]);

  const [pickerModal, setPickerModal] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraMode, setCameraMode] = useState('photo');
  const [recording, setRecording] = useState(false);
  const cameraRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const raw = await AsyncStorage.getItem('user');
        if (raw) setUser(JSON.parse(raw));
      } catch (err) {
        console.log('Error loading user:', err);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (uploading || success) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [uploading, success]);

  const categories = ['education', 'medical', 'food', 'business', 'shelter', 'other'];

  const pickFromGallery = (type = 'photo') => {
    launchImageLibrary(
      {
        mediaType: type,
        quality: 0.8,
      },
      (res) => {
        if (res.didCancel) return;
        if (res.errorMessage) {
          Alert.alert('Error', res.errorMessage);
          return;
        }
        const asset = res.assets?.[0];
        if (!asset) return;

        setMediaList(prev => [
          ...prev,
          {
            uri: asset.uri,
            type: asset.type.startsWith('video') ? 'video' : 'image',
            name: asset.fileName || `file.${asset.uri.split('.').pop()}`,
          },
        ]);
        setPickerModal(false);
      }
    );
  };

  const openCamera = (mode = 'photo') => {
    setCameraMode(mode);
    setCameraVisible(true);
    setPickerModal(false);
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const result = await cameraRef.current.capture?.() || await cameraRef.current.takePicture?.();
      const uri = result?.uri || result?.path || null;
      if (!uri) return Alert.alert('Capture failed', 'Could not get image from camera');

      setMediaList(prev => [...prev, { uri, type: 'image', name: `photo_${Date.now()}.jpg` }]);
      setCameraVisible(false);
    } catch (err) {
      console.log('takePhoto error:', err);
      Alert.alert('Camera error', String(err));
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;
    try {
      setRecording(true);
      const rec = await cameraRef.current.record?.();
      const uri = rec?.uri || rec?.path;
      if (uri) {
        setMediaList(prev => [...prev, { uri, type: 'video', name: `video_${Date.now()}.mp4` }]);
      }
    } catch (err) {
      console.log('startRecording error:', err);
    } finally {
      setRecording(false);
      setCameraVisible(false);
    }
  };

  const stopRecording = async () => {
    try {
      await cameraRef.current.stopRecording?.();
      setRecording(false);
      setCameraVisible(false);
    } catch (err) {
      console.log('stopRecording error:', err);
    }
  };

  const removeMedia = (index) => setMediaList(prev => prev.filter((_, i) => i !== index));

  const submitRequest = async () => {
    if (!user?.id) return Alert.alert('Login required', 'Please sign in first.');
    if (!title.trim() || !description.trim()) return Alert.alert('Validation', 'Title & description required');

    setUploading(true);
    setSuccess(false);

    try {
      const form = new FormData();
      form.append('user_id', String(user.id));
      form.append('title', title);
      form.append('description', description);
      form.append('category', category);
      form.append('contact_address', contactAddress);

      mediaList.forEach((m, idx) => {
        form.append('media[]', {
          uri: m.uri,
          type: m.type === 'image' ? 'image/jpeg' : 'video/mp4',
          name: m.name || `file_${Date.now()}_${idx}`,
        });
      });

      const SERVER_URL = 'https://riyawacontractors.com/supportmanu/api/request_help_server.php';

      const res = await axios.post(SERVER_URL, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      if (res?.data?.success) {
        setSuccess(true);
        setTitle(''); setDescription(''); setCategory('other'); setContactAddress(''); setMediaList([]);
        setTimeout(() => setSuccess(false), 2300);
      } else {
        Alert.alert('Upload failed', res?.data?.message || 'Unknown error');
      }
    } catch (err) {
      console.log('submitRequest error:', err);
      Alert.alert('Network error', 'Could not upload request. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const renderMediaItem = ({ item, index }) => (
    <View style={styles.mediaThumb}>
      <Image source={{ uri: item.uri }} style={styles.mediaImage} />
      <Pressable style={styles.removeButton} onPress={() => removeMedia(index)}>
        <Ionicons name="close-circle" size={20} color="#fff" />
      </Pressable>
      {item.type === 'video' && (
        <View style={styles.videoBadge}>
          <Ionicons name="videocam" size={14} color="#fff" />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* USER INFO CARD */}
        <View style={styles.userCard}>
          <Image
            source={user?.avatar ? { uri: user.avatar } : DefaultUserImage}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user ? `${user.first_name} ${user.last_name}` : 'Guest User'}</Text>
            <Text style={styles.email}>{user?.email ?? 'guest@example.com'}</Text>
          </View>
        </View>

        <Text style={styles.title}>Request Help</Text>
        <Text style={styles.subText}>Create a request — posts go public only after SupportManu approves.</Text>

        {/* FORM */}
        <View style={styles.formCard}>
          <Text style={styles.label}>Title</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="Short title" style={styles.input} />
          <Text style={styles.label}>Description</Text>
          <TextInput value={description} onChangeText={setDescription} placeholder="Describe your need" style={[styles.input, { minHeight: 100 }]} multiline />
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryRow}>
            {categories.map(cat => {
              const active = cat === category;
              return (
                <TouchableOpacity key={cat} onPress={() => setCategory(cat)} style={[styles.catButton, active && styles.catButtonActive]}>
                  <Text style={[styles.catButtonText, active && styles.catButtonTextActive]}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.label}>Full Contact Address</Text>
          <TextInput value={contactAddress} onChangeText={setContactAddress} placeholder="Street, City, State, Phone" style={styles.input} />

          {/* Media Upload */}
          <Text style={[styles.label, { marginTop: 10 }]}>Upload image/Video Evidence</Text>
          <View style={styles.mediaActions}>
            <TouchableOpacity style={styles.cameraBtn} onPress={() => setPickerModal(true)}>
              <Ionicons name="image-outline" size={18} color="#fff" />
              <Text style={styles.cameraBtnText}>Upload</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={mediaList}
            horizontal
            keyExtractor={(_, i) => String(i)}
            renderItem={renderMediaItem}
            style={{ marginTop: 12 }}
            showsHorizontalScrollIndicator={false}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={submitRequest}>
            <Text style={styles.submitBtnText}>Send Request</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* PICKER MODAL */}
      <Modal visible={pickerModal} transparent animationType="slide">
        <Pressable style={styles.modalBG} onPress={() => setPickerModal(false)} />
        <View style={styles.bottomSheet}>
          <Text style={styles.sheetTitle}>Select Media</Text>
          <TouchableOpacity style={styles.sheetBtn} onPress={() => pickFromGallery('photo')}>
            <Ionicons name="image" size={22} color="#2563eb" />
            <Text style={styles.sheetBtnText}>Choose Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetBtn} onPress={() => pickFromGallery('video')}>
            <Ionicons name="videocam" size={22} color="#2563eb" />
            <Text style={styles.sheetBtnText}>Choose Video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetBtn} onPress={() => openCamera('photo')}>
            <Ionicons name="camera" size={22} color="#2563eb" />
            <Text style={styles.sheetBtnText}>Use Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sheetBtn, { borderTopWidth: 0.5 }]} onPress={() => setPickerModal(false)}>
            <Text style={[styles.sheetBtnText, { color: '#ef4444' }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* CAMERA MODAL */}
      <Modal visible={cameraVisible} animationType="slide">
        <View style={styles.cameraModal}>
          <View style={styles.camHeader}>
            <TouchableOpacity onPress={() => setCameraVisible(false)}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.camHeaderText}>{cameraMode === 'photo' ? 'Capture Photo' : 'Record Video'}</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.cameraWrapper}>
            <Camera
              style={styles.camera}
              ref={cameraRef}
              cameraOptions={{ flashMode: 'auto', focusMode: 'on', zoomMode: 'on' }}
            />
          </View>

          <View style={styles.cameraFooter}>
            {cameraMode === 'photo' ? (
              <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
                <View style={styles.captureInner} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.captureBtn, recording && { backgroundColor: '#ff4d4f' }]} onPress={recording ? stopRecording : startRecording}>
                <View style={styles.captureInner} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Upload + success overlay */}
      {(uploading || success) && (
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <View style={styles.overlayInner}>
            {uploading && (
              <>
                <ActivityIndicator size="large" color="#0ea5e9" />
                <Text style={styles.overlayText}>Posting your request...</Text>
              </>
            )}
            {success && (
              <>
                <View style={styles.tickCircle}>
                  <Ionicons name="checkmark" size={48} color="#fff" />
                </View>
                <Text style={styles.overlayText}>Request submitted successfully!</Text>
              </>
            )}
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  userCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 14 },
  name: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  email: { fontSize: 13, color: '#64748B', marginTop: 2 },
  userId: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 6 },
  subText: { color: '#475569', fontSize: 14, marginBottom: 14 },
  formCard: {  borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  label: { fontSize: 14, color: '#334155', marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 14, fontSize: 14, color: '#0f172a' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#E6E7EB', marginRight: 8, marginBottom: 8 },
  catButtonActive: { backgroundColor: '#0ea5e9' },
  catButtonText: { color: '#0f172a', fontWeight: '600', fontSize: 13 },
  catButtonTextActive: { color: '#fff' },
  mediaActions: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  cameraBtn: { backgroundColor: '#06b6d4', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  cameraBtnText: { color: '#fff', fontWeight: '700', marginLeft: 6 },
  mediaThumb: { width: 120, height: 120, borderRadius: 12, overflow: 'hidden', marginRight: 12 },
  mediaImage: { width: '100%', height: '100%' },
  removeButton: { position: 'absolute', top: 6, right: 6, backgroundColor: '#ff4d4f', borderRadius: 14, padding: 2 },
  videoBadge: { position: 'absolute', bottom: 6, left: 6, backgroundColor: '#00000088', padding: 6, borderRadius: 6 },
  submitBtn: { marginTop: 20, backgroundColor: '#0f172a', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  modalBG: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  bottomSheet: { backgroundColor: '#fff', padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  sheetBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  sheetBtnText: { marginLeft: 14, fontSize: 15 },
  cameraModal: { flex: 1, backgroundColor: '#000' },
  camHeader: { height: 60, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' },
  camHeaderText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cameraWrapper: { flex: 1 },
  camera: { flex: 1 },
  cameraFooter: { height: 120, alignItems: 'center', justifyContent: 'center' },
  captureBtn: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  captureInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#0f172a' },
  overlay: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: '#00000055', justifyContent: 'center', alignItems: 'center' },
  overlayInner: { width: width - 60, padding: 28, backgroundColor: '#0f172a', borderRadius: 16, alignItems: 'center' },
  overlayText: { color: '#fff', fontWeight: '700', fontSize: 16, marginTop: 14, textAlign: 'center' },
  tickCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#22c55e', justifyContent: 'center', alignItems: 'center' },
});
