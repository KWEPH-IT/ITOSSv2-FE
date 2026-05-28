import axios from "axios";
import { message as antdMessage } from "antd";

const API = axios.create({
    baseURL: import.meta.env.VITE_SERVER_API_URL,
    withCredentials: true,
});

// ✅ Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // ✅ 1. Handle unauthorized globally
    if (status === 401) {
      antdMessage.error("Your session has ended. Please log in again.");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/";
    }

    // ✅ 2. Normalize all error messages
    const normalizedError = {
      message:
        error?.response?.data?.message || "Server error",
      status,
    };

    return Promise.reject(normalizedError);
  }
);




export default API;