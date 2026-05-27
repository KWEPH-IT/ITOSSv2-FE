import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserData } from "../hooks/user_hooks";
import { Loader } from "../components/Loader";

const HomeRedirect = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { userData, loading } = getUserData(userId);

  useEffect(() => {
    if (userId && !loading && userData) {
      if (userData?.Department === "IT") {
        navigate("/it-home");
      } else {
        navigate("/user-home");
      }
    }
  }, [userId, userData, loading, navigate]); // ✅ FIXED

  return <Loader></Loader>;
};

export default HomeRedirect;