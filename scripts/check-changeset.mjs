import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const base = process.argv[2];

// A frontmatter block that names no package, such as `---\n---`.
const EMPTY_CHANGESET = /^---\r?\n\s*---/;

// A frontmatter block that names this package and a release bump.
const NAME_AND_BUMP =
  /^---\r?\n[\s\S]*?["']?antislop-plugin["']?:\s*(patch|minor|major)\s*\r?\n[\s\S]*?---/m;

assert(base, "Pass the pull request base commit.");

const diff = spawnSync("git", ["diff", "--name-only", `${base}...HEAD`], { encoding: "utf8" });

assert.ifError(diff.error);

assert.equal(diff.status, 0, diff.stderr);

const paths = diff.stdout.trim().split("\n");

const shipped = paths.some(
  (path) =>
    /^(src\/|packaging\/(eslint\/|config\.ts$|README\.md$)|skills\/|README\.md$|docs\/(UPSTREAM|RELEASING|ESLINT)\.md$|LICENSE$|package\.json$|pnpm-lock\.yaml$|tsdown(\.eslint)?\.config\.ts$|tsconfig\.(build|packaging)\.json$)/.test(
      path,
    ) && !path.endsWith(".test.ts"),
);

if (shipped) {
  const changesets = paths.filter(
    (path) => /^\.changeset\/.+\.md$/.test(path) && path !== ".changeset/README.md",
  );

  const valid = changesets.some((path) => {
    try {
      const text = readFileSync(path, "utf8");

      // An empty changeset carries no package and no bump. Accept it when the
      // release version is being set by hand, such as a rename or a version reset.
      if (EMPTY_CHANGESET.test(text)) return true;

      return NAME_AND_BUMP.test(text);
    } catch (cause) {
      if (cause.code === "ENOENT") return false;

      throw cause;
    }
  });

  assert(valid, "Shipped package or skill changes require an antislop-plugin changeset.");
}
