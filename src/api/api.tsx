import axios from "axios";
import { message } from "antd";

const API = axios.create({
    baseURL: import.meta.env.VITE_SERVER_API_URL,
    withCredentials: true,
});

// ✅ Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      message.error("Your session has ended. Please log in again.");
      
      // Redirect to login
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);


export default API;