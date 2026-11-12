
import React, { createContext, useContext, useState } from "react";

interface AuthContextType {
  userId: string | null;
  setUserId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string | null>(() => {
    return localStorage.getItem("user");
  });

  return (
    <AuthContext.Provider value={{ userId, setUserId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
