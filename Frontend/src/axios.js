import axios from "axios";

const instance = axios.create({
  // baseURL: "https://hotels-reservation-system.herokuapp.com",
  baseURL: "http://localhost:4000",
});

// Attach Authorization header automatically if token exists
instance.interceptors.request.use(
  (config) => {
    try {
      const storedAuth = localStorage.getItem("adminAuth");
      if (storedAuth) {
        const { token } = JSON.parse(storedAuth);
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      // ignore storage errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
