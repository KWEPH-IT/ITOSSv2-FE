import { message } from "antd";
import API from "../api/api"; 

const API_URL = import.meta.env.VITE_SERVER_API_URL

export const handleLogin = async(
    values: {username: string, password: string},
    setLoading: (loading: boolean) => void
    //navigate: (path:string) => void,
    //setUserId: (id :string) => void
) => {
    try {
        setLoading(true);
        const response  = await API.post(`${API_URL}/auth/login`, values);

        if (response.data.status === "mfa_required") {
            window.location.href = response.data.mfa_url;
            return;
        }
        setLoading(false);

    }
    catch (error: any) {
      console.error("LOGIN ERROR:", error);
      message.error(
          error.response?.data?.message || "Invalid user credentials!"
      );
  }
}

export const confirmPass = async (password: string) => {
    try {
      const response = await API.post(`${API_URL}/auth/confirmPass`, { password });
  
      if (response.data.success) {
        return true;
      } else {
        message.error(response.data.message || "Invalid password. Please try again!");
        return false;
      }
    } catch (error) {
      message.error("Cannot verify your password. Please try again!");
      return false;
    }
};

export default API_URL;
