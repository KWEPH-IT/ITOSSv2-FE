import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/api";
import { Loader } from "../components/Loader";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await API.get("/auth/verify_token", {
          withCredentials: true, // IMPORTANT
        });

        setIsAuth(true);
      } catch (err) {
        setIsAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuth === null) return <Loader />;

  return isAuth ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;