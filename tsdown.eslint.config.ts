import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    "eslint/index": "packaging/eslint/index.ts",
    "eslint/effect": "packaging/eslint/effect.ts",
  },
  format: ["esm"],
  target: "node22",
  tsconfig: "tsconfig.build.json",
  outDir: "dist",
  outExtensions: () => ({ js: ".mjs", dts: ".d.mts" }),
  deps: { alwaysBundle: ["@oxlint/plugins"] },
  dts: true,
  sourcemap: true,
  clean: false,
});
