import { message } from "antd";
import API from "../api/api"; 
import { handleLoggedAction } from "../utils/Logger";

const API_URL = import.meta.env.VITE_SERVER_API_URL

export const handleLogin = async(
    values: {username: string, password: string},
    navigate: (path:string) => void,
    setUserId: (id :string) => void
) => {
    try {
        const response  = await API.post(`${API_URL}/auth/login`, values);

        const user = response.data.user
        localStorage.setItem("user", user)
        setUserId(user)
        message.success(response.data.message)
        handleLoggedAction(user, 'LOGIN SUCCESS', '')
        
        navigate("/home-redirect");
       
    }
    catch(error:any){
        message.error("Invalid user credentials!")
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
