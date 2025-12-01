import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  console.log("---------------------------------------------------");
  console.log("BUILD DEBUG: VITE_GEMINI_API_KEY from process.env:", process.env.VITE_GEMINI_API_KEY ? "PRESENT" : "MISSING");
  console.log("BUILD DEBUG: VITE_GEMINI_API_KEY from loadEnv:", env.VITE_GEMINI_API_KEY ? "PRESENT" : "MISSING");
  console.log("---------------------------------------------------");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
