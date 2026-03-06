import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  userId: string | null;
  setUserId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("user");
    //console.log("Retrieved userId from localStorage:", storedUserId); // ✅ Debugging
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
   // console.log("Updated userId:", userId); // ✅ Debugging
  }, [userId]);

  return (
    <AuthContext.Provider value={{ userId, setUserId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
 // console.log("AuthContext:", context); // 🔍 Debugging step
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
