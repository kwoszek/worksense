import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

// Centralize large third-party chunks so Lighthouse sees smaller entry files and modern-only output.
const manualChunks = (id: string) => {
  if (!id.includes("node_modules")) return undefined;
  if (id.includes("@heroui")) return "vendor-heroui";
  if (id.includes("react")) return "vendor-react";
  if (id.includes("redux")) return "vendor-redux";
  if (id.includes("@tanstack")) return "vendor-query";
  return "vendor";
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tsconfigPaths(), svgr(), tailwindcss()],
  build: {
    target: "es2020",
    cssTarget: "es2020",
    modulePreload: { polyfill: false },
    minify: "esbuild",
    sourcemap: false,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks,
        inlineDynamicImports: false,
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
  esbuild: {
    target: "es2020",
    drop: mode === "production" ? ["console", "debugger"] : [],
    treeShaking: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020",
    },
  },
}));
