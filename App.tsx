import React from "react";
import { Dashboard } from "./screens/Dashboard";

export default function App() {
  // Emergency fallback - render a simple test div first
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>TESTE - App está funcionando</h1>
      <p>Se você está vendo isso, o React está carregando.</p>
      <Dashboard />
    </div>
  );
}
