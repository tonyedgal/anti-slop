# Upstream source

- Repository: https://github.com/dmmulroy/anti-slop
- Branch: main
- Integrated commit: `c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b`
- Original rules: Dillon Mulroy and upstream contributors. Preserve the root MIT licence and nested third-party notices.
- Distribution maintainer: Tony Edgal, https://github.com/tonyedgal/anti-slop

The source rules, tests, skills, and copy script match this revision. Intentional additions are the npm build, shared configurations, package checks, independent release process, and fork documentation/metadata. Upstream does not maintain this npm package.

## Manual update

Start with a clean working tree. Preserve unfinished work before merging. Do not reset or automatically stash it.

One-time setup, if the remote is missing:

```sh
git remote add -t main upstream https://github.com/dmmulroy/anti-slop.git
```

For each update:

```sh
git fetch --no-tags upstream main
git log --oneline HEAD..upstream/main
git diff HEAD...upstream/main
git merge --no-ff --no-commit upstream/main
```

Only upstream main is merged. Unmerged upstream branches are not imported. The merge stops before a commit so the maintainer can review it.

Resolve conflicts explicitly. Preserve this fork's package name, maintainer metadata, exports, version, and manual release workflow. Review upstream dependency and workflow changes rather than overwriting either side wholesale. Regenerate the pnpm lockfile after resolving dependency changes.

Review new or removed rule exports and update the explicit defaults in `packaging/config.ts`. Update package inventory assertions when the upstream rule count changes. Newly enabled defaults are breaking changes. Keep Oxlint and its helper pinned to the same tested version.

Run the checks in RELEASING.md. Keep source rules and skill assets consistent with upstream. Do not add npm-specific behavior to the skill.

Use `git rev-parse upstream/main` to record the reviewed commit above after the whole merge is reconciled. Include that commit in the Changeset. Commit the completed merge after review. Do not advance the recorded commit for an incomplete update.

Upstream and this fork have independent package versions. A successful text merge alone does not prove compatibility.
