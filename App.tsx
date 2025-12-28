import React, { useState, useEffect } from "react";
import { LoginScreen } from "./screens/LoginScreen";
import { Dashboard } from "./screens/Dashboard";

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("google_access_token")
  );

  const handleLogout = () => {
    localStorage.removeItem("google_access_token");
    localStorage.removeItem("google_user_profile");
    setAccessToken(null);
  };

  // Handle OAuth redirect
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const token = hashParams.get("access_token");
    
    if (token) {
      localStorage.setItem("google_access_token", token);
      setAccessToken(token);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (!accessToken) {
    return <LoginScreen />;
  }

  return <Dashboard accessToken={accessToken} onLogout={handleLogout} />;
}
