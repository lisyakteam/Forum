import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import path from "path"

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      react: "@preact/compat",
      "react-dom": "@preact/compat",
      "react-dom/test-utils": "@preact/test-utils",
      "react/jsx-runtime": "@preact/compat/jsx-runtime",
      "$": path.resolve(__dirname, "app")
    },
  },
});
