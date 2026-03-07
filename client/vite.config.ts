import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwind from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
  base: "/",
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __APP_ID__: JSON.stringify("seller-fee-compare"),
  },
  server: {
    port: 6203,
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name].[hash][extname]",
        chunkFileNames: "assets/[name].[hash].js",
        entryFileNames: "assets/[name].[hash].js",
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
  ssgOptions: {
    includedRoutes() {
      return [
        "/",
        "/market-compare",
        "/payment-compare",
        "/shipping-compare",
        "/about",
        "/privacy",
      ];
    },
  },
});
