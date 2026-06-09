import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  // 相對路徑：assets 用 ./ 載入，部署到 GitHub Pages 子路徑（user.github.io/repo/）也不會 404。
  base: "./",
  plugins: [vue()],
  optimizeDeps: {
    exclude: ["@electric-sql/pglite"]
  }
});
