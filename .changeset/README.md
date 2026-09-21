# Changesets

Run `pnpm changeset` for changes to the shipped package or skill. Select `@spacemansh/anti-slop`, choose the version bump, and describe the user-visible change. A skill-only change still advances the package version and the shared release tag.

Before 1.0, breaking changes use a minor bump. Compatible fixes use a patch. Test-only and contributor-documentation changes do not require a release. Run `pnpm version-packages` manually to consume changesets. This fork versions independently from upstream.

See [RELEASING.md](../docs/RELEASING.md). Publication requires the manually started release workflow.
