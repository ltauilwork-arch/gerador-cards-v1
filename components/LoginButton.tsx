import React, { useState, useEffect } from "react";
import { useGoogleLogin, hasGrantedAllScopesGoogle } from "@react-oauth/google";
import { useAuth } from "../contexts/AuthContext";

export const LoginButton = () => {
  const { setAccessToken, setUser, isAuthenticated, logout, user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if GSI is loaded
  useEffect(() => {
    const checkGSI = () => {
      if (typeof window !== "undefined" && (window as any).google?.accounts) {
        setIsReady(true);
      } else {
        // Retry after a short delay
        setTimeout(checkGSI, 100);
      }
    };
    checkGSI();
  }, []);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Login Success:", tokenResponse);
      setAccessToken(tokenResponse.access_token);
      
      // Fetch user profile
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        const profile = await res.json();
        setUser(profile);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
        setError("Falha ao obter perfil do usuário");
      }
    },
    onError: (errorResponse) => {
      console.error("Login Failed:", errorResponse);
      setError("Falha no Login do Google. Verifique o console para mais detalhes.");
    },
    scope: "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/documents.readonly",
  });

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
            <span className="text-sm font-medium text-gray-700">{user.name}</span>
          </div>
        )}
        <button
          onClick={logout}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          Sair
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        {error}
        <button onClick={() => setError(null)} className="ml-2 underline">Tentar novamente</button>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="px-4 py-2 text-sm text-gray-500">
        Carregando...
      </div>
    );
  }

  return (
    <button
      onClick={() => login()}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      Entrar com Google
    </button>
  );
};
