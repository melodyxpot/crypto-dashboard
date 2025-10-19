import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export const reactConfig = defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
