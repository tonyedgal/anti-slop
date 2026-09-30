# antislop-plugin

The releases below the rename were published under the name `@spacemansh/anti-slop`.
That name is deprecated. Install `antislop-plugin` instead.

## 0.1.0

### Minor Changes

- Rename the package from `@spacemansh/anti-slop` to `antislop-plugin` and restart the version. Install and import specifiers change. Rule names, the `antiSlopConfig` exports, and the `anti-slop` and `anti-slop-effect` namespaces do not change, so existing lint configuration needs no edits.

## 0.3.0

### Minor Changes

- f93031e: Add ESLint entry points for all 23 anti-slop rules. Keep Effect rules opt-in and
  preserve the existing Oxlint entry points.

### Patch Changes

- 9f5fd9b: Create a Changesets version pull request and publish the reviewed version with a matching Git tag and GitHub release when that pull request is merged.

## 0.2.0

### Minor Changes

- Add a community-maintained ESM npm distribution of the existing generic and Effect plugins, with shared configurations and Node 22 support. Preserve upstream rule behavior and skill distribution from dmmulroy/anti-slop commit. Coordinate package and skill changes through one manually prepared Changesets release version.
