import type { ESLint, Linter } from "eslint";

import effect from "../../src/effect/index.ts";

import { withPositions } from "./positions.mjs";

/** ESLint adapter for the five opt-in Effect rules. */
const configs: Record<string, Linter.Config> = {};

const plugin: Omit<ESLint.Plugin, "configs"> & { configs: Record<string, Linter.Config> } =
  Object.assign(withPositions(effect), {
    meta: { name: "@spacemansh/anti-slop/effect", namespace: "anti-slop-effect" },
    configs,
  });

const rules: Record<string, "error"> = {};

for (const name of Object.keys(effect.rules)) {
  rules[`anti-slop-effect/${name}`] = "error";
}

/** Enable the five Effect rules without enabling the generic rules. */
export const all: Linter.Config = {
  plugins: { "anti-slop-effect": plugin },
  rules,
};

configs.all = all;

export default plugin;
