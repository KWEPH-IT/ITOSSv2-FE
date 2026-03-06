// ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API from '../api/api';

const API_URL = import.meta.env.VITE_SERVER_API_URL

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get(`${API_URL}/auth/verify_token`);
        console.log("Auth success:", res.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Auth failed:", err);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;