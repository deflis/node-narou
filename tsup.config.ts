import { defineConfig } from "tsup";

export default defineConfig({
  target: "es2020",
  format: ["cjs", "esm"],
  clean: true,
  dts: true,
  entry: ["src/index.ts", "src/index.browser.ts"],
  sourcemap: true,
});