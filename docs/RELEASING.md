# Releasing @spacemansh/anti-slop

Tony Edgal maintains this community npm distribution. Upstream does not own its compatibility or releases. The npm package and repository skill share one release version and tag. Skill distribution stays unchanged.

## Checks

Use Node 22.18.0 or a supported newer release and pnpm 10.33.0.

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm check:packaging-types
pnpm lint:packaging
pnpm fmt:packaging:check
pnpm test:release
pnpm check:package
```

The package check builds a tarball and tests isolated npm and pnpm consumers. It checks exports, configurations, rule overrides, Effect composition, fixes, and declarations. It does not publish. It retains the tarball and checksum in `.release/`.

For a small manual check of the built plugin:

```sh
pnpm build
pnpm exec oxlint --config packaging/manual.config.mjs packaging/fixtures/violations.ts
```

Expect a nonzero exit with `anti-slop/no-reflect-get` and `anti-slop/no-runtime-typeof`. This fixture deliberately fails. It is not part of the passing packaging lint command.

## Prepare a release

1. Sync upstream when needed using [UPSTREAM.md](UPSTREAM.md). Update the recorded source commit.
2. Run `pnpm changeset`. Include the upstream commit in the release description. Skill-only changes also need a Changeset; test-only and contributor-documentation changes do not.
3. Commit the change and its Changeset. Push or merge both into `main`.
4. The Release workflow creates or updates a Changesets version pull request. That pull request consumes the Changesets and updates the manifest, lockfile, and changelog.
5. Review the version pull request. The Release workflow checks the source before updating this pull request. Merge it when the release is ready.
6. The merge starts the Release workflow again. Changesets publishes the package, pushes the matching Git tag, and creates the GitHub Release.

The version pull request is the release approval. A normal push cannot publish while unconsumed Changesets exist. There is no scheduled upstream sync or automated skill archive.

Versions are independent from upstream. Keep the current version until Changesets advances it. Before 1.0, breaking changes use a minor bump. From 1.0, breaking changes use a major bump. New default rules, stricter diagnostics, removed rules, and narrowed compatibility are breaking changes. Compatible fixes use patch releases.

## One-time publication setup

1. Establish permission to publish `@spacemansh/anti-slop` under the `spacemansh` npm scope.
2. Complete npm's first-publication setup if required. This is a separate maintainer action, not part of local verification.
3. Configure [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) for GitHub owner `tonyedgal`, repository `anti-slop`, and workflow `release.yml`. Allow direct publishing.
4. Confirm hosted CI passes before merging the first version pull request.

The workflow uses npm 11.5.1 and Node 22.18.0 on a GitHub-hosted runner. It runs on pushes to `main`. Changesets creates the version pull request while release notes remain. After that pull request is merged, the workflow packs with Changesets, verifies the exact tarball, publishes those bytes, and creates the matching tag and GitHub Release. No registry credentials or settings are configured by this repository.

## Recovery

If checks fail, publication stops. Fix the cause before retrying. If npm succeeds but the GitHub Release is missing, inspect npm, the retained workflow artifact, and the workflow commit. Repair the release only at that verified commit.

Never reuse a published npm version or replace it with different bytes. Publish a patch to correct a released package. Do not assume a successful no-op retry creates a missing GitHub Release.

Local tests do not prove registry ownership, OIDC access, or hosted workflow behavior.
