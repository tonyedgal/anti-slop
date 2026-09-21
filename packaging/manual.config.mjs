import { defineConfig } from "oxlint";

import { antiSlopConfig } from "../dist/config.mjs";

export default defineConfig({
  ...antiSlopConfig,
  jsPlugins: [{ name: "anti-slop", specifier: "../dist/index.mjs" }],
});
