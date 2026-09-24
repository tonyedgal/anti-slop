# Package and configuration

This is Tony Edgal's community npm distribution of [Dillon Mulroy's anti-slop](https://github.com/dmmulroy/anti-slop). Tony maintains package compatibility and releases. It is not an official upstream npm package.

Upstream recommends vendoring so teams can change and maintain their own rules. This fork adds npm installation. See [source provenance](../docs/UPSTREAM.md) for the source commit and update procedure.

## Install and enable

Requires Node 22.18.0 or newer. The package exports ESM only.

```sh
npm install --save-dev @spacemansh/anti-slop oxlint @oxlint/plugins
```

Add `oxlint.config.ts`:

```ts
import { defineConfig } from "oxlint";
import { antiSlopConfig } from "@spacemansh/anti-slop/config";

export default defineConfig(antiSlopConfig);
```

Run `npx oxlint .`. The shared configuration enables all 18 generic rules and the native `oxc/no-accumulating-spread` rule at `error`. Installation alone does not configure or run the linter.

## Override rules

```ts
import { defineConfig } from "oxlint";
import { antiSlopConfig } from "@spacemansh/anti-slop/config";

export default defineConfig({
  ...antiSlopConfig,
  rules: {
    ...antiSlopConfig.rules,
    "anti-slop/no-runtime-typeof": "off",
  },
});
```

When adding the preset to existing configuration, merge `jsPlugins` arrays and `rules` maps. Put overrides last. Preserve existing ignore patterns and other settings. If your native `plugins` list excludes `oxc`, add it for the companion rule.

## Optional Effect rules

```ts
import { defineConfig } from "oxlint";
import { antiSlopConfig, antiSlopEffectConfig } from "@spacemansh/anti-slop/config";

export default defineConfig({
  jsPlugins: [...antiSlopConfig.jsPlugins, ...antiSlopEffectConfig.jsPlugins],
  rules: { ...antiSlopConfig.rules, ...antiSlopEffectConfig.rules },
});
```

This enables the five Effect rules in addition to the generic rules.

## JSON configuration

Register `{ "name": "anti-slop", "specifier": "@spacemansh/anti-slop" }` under `jsPlugins`. Copy the generic rule map from the [manual installation instructions](../README.md#manual-local-installation).

The optional Effect specifier is `@spacemansh/anti-slop/effect`. Registering a plugin alone does not enable its rules. JSON configuration cannot import the shared JavaScript configuration.

## File locations

- `src/`: canonical upstream rules, tests, and plugin entry points.
- `packaging/`: shared configurations and package-specific checks.
- `dist/`: generated JavaScript, declarations, and source maps. Run `pnpm build` to generate them.
- `.release/spacemansh-anti-slop-<version>.tgz`: local tarball produced by `pnpm check:package`.
- `node_modules/@spacemansh/anti-slop/`: installed package in a consuming project. No rule files are copied into the project's source.

The package exports `@spacemansh/anti-slop`, `@spacemansh/anti-slop/effect`,
`@spacemansh/anti-slop/config`, `@spacemansh/anti-slop/eslint`, and
`@spacemansh/anti-slop/eslint/effect` from `dist/`. The [ESLint guide](../docs/ESLINT.md)
shows the ESLint-only installation. The tarball also includes package metadata,
documentation, the root licence, and the ESLint Stylistic licence and provenance.
Tests and skill assets are not included.

## Local testing and releases

Run `pnpm check:package` to build and test the tarball without publishing. Install the resulting tarball with your package manager for local use.

See the [release guide](../docs/RELEASING.md) for checks and manual release steps. Skill distribution remains repository-based.
