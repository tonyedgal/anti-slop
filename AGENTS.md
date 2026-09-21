# Repository guidance

- `src/` is the canonical plugin implementation.
- Keep rules generic and suitable for reuse across repositories. Do not add application-specific names, paths, or exceptions.
- Use Oxlint's ESTree API; do not add another production parser.
- Add focused RuleTester coverage for semantic rule changes.
- Run `pnpm sync:skill-assets` after changing production source.
- Run `pnpm check` before committing.
- Keep npm-only configuration in `packaging/`; do not add it to copied skill assets.
- Use the repository's anti-slop skill guidance and run `pnpm lint:packaging` on new implementation code. Do not weaken rules to make packaging pass.
- Run `pnpm check:packaging-types` and `pnpm check:package` for package changes. The latter tests an actual tarball in isolated consumers without publishing.
- Add an `@spacemansh/anti-slop` changeset for shipped package or skill changes. Preserve skill distribution and upstream rule behavior.
- Tony maintains this community npm distribution. Publish only through the manually started release workflow after activation.
- Merge updates only from upstream main. Follow docs/UPSTREAM.md and preserve upstream licenses, rules, and skill behavior.
