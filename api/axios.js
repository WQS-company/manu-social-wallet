// api/axios.js
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = "https://riyawacontractors.com/supportmanu/api/api.php";

const instance = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Attach token automatically from AsyncStorage for every request
instance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: handle 401 globally (you may adjust behavior)
instance.interceptors.response.use(
  (res) => res,
  (error) => {
    // Keep simple — return the error for per-screen handling
    return Promise.reject(error);
  }
);

export default instance;
