import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/api";
import { Loader } from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { getUserData } from "../hooks/user_hooks";

interface ProtectedRouteProps {
  children: JSX.Element;
  ITOnly?: boolean;
}


const ProtectedRoute = ({
  children,
  ITOnly = false,
}: ProtectedRouteProps) => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const { userId } = useAuth();
  const { userData, loading } = getUserData(userId);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await API.get("/auth/verify_token", {
          withCredentials: true,
        });

        setIsAuth(true);
      } catch {
        setIsAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (loading || isAuth === null) {
    return <Loader />;
  }
  
  if (!isAuth) {
    return <Navigate to="/" replace />;
  }
  
  if (!userData) {
    return <Navigate to="/" replace />;
  }
  
  if (ITOnly && userData.Department !== "IT") {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;