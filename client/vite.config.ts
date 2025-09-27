import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  return {
    server: {
      host: "0.0.0.0", // dễ chạy hơn "::" (IPv4/IPv6)
      port: 8080,
    },
    plugins: [
      react(),
      ...(mode === "development" ? [componentTagger()] : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"), // không cần "./src"
      },
    },
  };
});
