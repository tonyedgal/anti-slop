import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "effect/index": "src/effect/index.ts",
    config: "packaging/config.ts",
  },
  format: ["esm"],
  target: "node22",
  tsconfig: "tsconfig.build.json",
  outExtensions: () => ({ js: ".mjs", dts: ".d.mts" }),
  dts: true,
  sourcemap: true,
  clean: true,
});
