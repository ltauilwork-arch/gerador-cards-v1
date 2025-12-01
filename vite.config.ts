import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
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
    define: {
      // Hardcoded key to bypass Vercel env var issues
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify("AIzaSyAbVxZm9kBX1vNfr3O7s-bzfByD7hhOP2A"),
    },
  };
});
