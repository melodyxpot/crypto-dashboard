import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, mergeConfig } from "vite";
import { reactConfig } from "@repo/vite-config/react";
import { viteConfig } from "@repo/jest-config/vite";

export default mergeConfig(
  mergeConfig(reactConfig, viteConfig),
  defineConfig({
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }),
);
