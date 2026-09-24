# ESLint package

Install ESLint, a TypeScript parser, and `@spacemansh/anti-slop`. Keep the parser
version compatible with the TypeScript version used by the project.

```sh
pnpm add -D eslint @typescript-eslint/parser @spacemansh/anti-slop
```

Add the 18 generic anti-slop rules to `eslint.config.mjs`:

```js
import tsParser from "@typescript-eslint/parser";
import { all as antiSlop } from "@spacemansh/anti-slop/eslint";

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: { parser: tsParser },
    ...antiSlop,
  },
];
```

The preset enables every generic anti-slop rule at `error`. To disable a rule,
use this `eslint.config.mjs`:

```js
import tsParser from "@typescript-eslint/parser";
import { all as antiSlop } from "@spacemansh/anti-slop/eslint";

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: { parser: tsParser },
    ...antiSlop,
    rules: {
      ...antiSlop.rules,
      "anti-slop/no-runtime-typeof": "off",
    },
  },
];
```

Projects that use Effect can enable the five additional rules:

```js
import tsParser from "@typescript-eslint/parser";
import { all as antiSlop } from "@spacemansh/anti-slop/eslint";
import { all as antiSlopEffect } from "@spacemansh/anti-slop/eslint/effect";

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: { parser: tsParser },
    plugins: { ...antiSlop.plugins, ...antiSlopEffect.plugins },
    rules: { ...antiSlop.rules, ...antiSlopEffect.rules },
  },
];
```

The package also exports each plugin as the default export from its subpath.
Registering a plugin does not enable its rules.
