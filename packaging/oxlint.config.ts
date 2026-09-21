import { defineConfig } from "oxlint";

import { antiSlopConfig } from "./config.ts";

export default defineConfig({
  ...antiSlopConfig,
  ignorePatterns: ["fixtures/**"],
  jsPlugins: [{ name: "anti-slop", specifier: "../src/index.ts" }],
});
