import type { ESLint, Linter } from "eslint";

import generic from "../../src/index.ts";

import { withPositions } from "./positions.mjs";

/** ESLint adapter for the 18 generic anti-slop rules. */
const configs: Record<string, Linter.Config> = {};

const plugin: Omit<ESLint.Plugin, "configs"> & { configs: Record<string, Linter.Config> } =
  Object.assign(withPositions(generic), {
    meta: { name: "@spacemansh/anti-slop", namespace: "anti-slop" },
    configs,
  });

const rules: Record<string, "error"> = {};

for (const name of Object.keys(generic.rules)) {
  rules[`anti-slop/${name}`] = "error";
}

/** ESLint preset for the 18 generic rules. */
export const all: Linter.Config = {
  plugins: { "anti-slop": plugin },
  rules,
};

configs.all = all;

export default plugin;
