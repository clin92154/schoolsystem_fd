// // apiService.js
// import axios from "axios";
// import { store } from "../store/store";
// import { setToken, logout } from "../features/auth/authSlice";

// const API_BASE_URL = "http://localhost:8000/api";

// const apiService = {
//   get: (endpoint, params = {}, token = null) => {
//     const headers = token ? { Authorization: `Bearer ${token}` } : {};
//     return axios.get(`${API_BASE_URL}/${endpoint}`, { params, headers });
//   },
//   post: (endpoint, data, token = null) => {
//     const headers = token ? { Authorization: `Bearer ${token}` } : {};
//     return axios.post(`${API_BASE_URL}/${endpoint}`, data, { headers });
//   },
//   put: (endpoint, data, token = null) => {
//     const headers = token ? { Authorization: `Bearer ${token}` } : {};
//     return axios.put(`${API_BASE_URL}/${endpoint}`, data, { headers });
//   },
//   delete: (endpoint, token = null) => {
//     const headers = token ? { Authorization: `Bearer ${token}` } : {};
//     return axios.delete(`${API_BASE_URL}/${endpoint}`, { headers });
//   },
// };

// // Axios interceptor for refreshing token
// axios.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         const refreshToken = sessionStorage.getItem("refreshToken");
//         if (!refreshToken) throw new Error("No refresh token available");
//         const response = await apiService.post("token/refresh/", {
//           refresh: refreshToken,
//         });
//         const newAccessToken = response.data.access;
//         sessionStorage.setItem("accessToken", newAccessToken);
//         store.dispatch(setToken(newAccessToken)); // Update Redux state
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//         return axios(originalRequest);
//       } catch (refreshError) {
//         store.dispatch(logout()); // Logout if refresh fails
//         sessionStorage.clear();
//         return Promise.reject(refreshError);
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default apiService;

// apiService.js
import axios from "axios";
import { store } from "../store/store";
import { setToken, logout } from "../features/auth/authSlice";

const API_BASE_URL = "http://localhost:8000/api";

const apiService = {
  get: (endpoint, params = {}, token = null) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axios.get(`${API_BASE_URL}/${endpoint}`, {
      params,
      headers,
      withCredentials: true, // 跨域請求攜帶憑據
    });
  },
  post: (endpoint, data, token = null) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axios.post(`${API_BASE_URL}/${endpoint}`, data, {
      headers,
      withCredentials: true, // 跨域請求攜帶憑據
    });
  },
  put: (endpoint, data, token = null) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axios.put(`${API_BASE_URL}/${endpoint}`, data, {
      headers,
      withCredentials: true, // 跨域請求攜帶憑據
    });
  },
  delete: (endpoint, token = null) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axios.delete(`${API_BASE_URL}/${endpoint}`, {
      headers,
      withCredentials: true, // 跨域請求攜帶憑據
    });
  },
};

// Axios interceptor for refreshing token
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = sessionStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token available");
        const response = await apiService.post("token/refresh/", {
          refresh: refreshToken,
        });
        const newAccessToken = response.data.access;
        sessionStorage.setItem("accessToken", newAccessToken);
        store.dispatch(setToken(newAccessToken)); // Update Redux state
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout()); // Logout if refresh fails
        sessionStorage.clear();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiService;
