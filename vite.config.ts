import { defineConfig } from "vite";
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import path from "path";

const aliases = [
  "dist",
  "pages",
  "features",
  "components",
  "hooks",
  "utils",
  "assets",
];

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), svgr()],
  resolve: {
    alias: aliases.map((alias) => ({
      find: `@${alias}`,
      replacement: path.resolve(__dirname, `src/${alias}`),
    })),
  },
});
