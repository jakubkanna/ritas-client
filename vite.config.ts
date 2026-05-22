import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
// import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    base: env.VITE_BASE_PATH || "/",
    assetsInclude: ["**/*.gltf"],
    plugins: [
      react(),
      viteStaticCopy({
        targets: [
          {
            src: "dist/index.html",
            dest: "",
            rename: "404.html",
          },
        ],
      }),
      // visualizer({
      //   filename: "./dist/stats.html",
      //   // open: true, // Automatically opens the stats in the browser
      // }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            three: ["three"],
            "model-viewer": ["@google/model-viewer"],
          },
        },
      },
    },
  };
});
