import React, { createContext, useContext, useState, ReactNode } from "react";
import { googleLogout } from "@react-oauth/google";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface AuthContextType {
  accessToken: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  setAccessToken: (token: string) => void;
  setUser: (user: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(
    localStorage.getItem("google_access_token")
  );
  const [user, setUserState] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem("google_user_profile");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const setAccessToken = (token: string) => {
    setAccessTokenState(token);
    localStorage.setItem("google_access_token", token);
  };

  const setUser = (user: UserProfile) => {
    setUserState(user);
    localStorage.setItem("google_user_profile", JSON.stringify(user));
  };

  const logout = () => {
    googleLogout();
    setAccessTokenState(null);
    setUserState(null);
    localStorage.removeItem("google_access_token");
    localStorage.removeItem("google_user_profile");
  };

  const isAuthenticated = !!accessToken;

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        isAuthenticated,
        setAccessToken,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
