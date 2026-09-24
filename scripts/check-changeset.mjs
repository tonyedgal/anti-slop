import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const base = process.argv[2];

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
      return /^---\r?\n[\s\S]*?["']?@spacemansh\/anti-slop["']?:\s*(patch|minor|major)\s*\r?\n[\s\S]*?---/m.test(
        readFileSync(path, "utf8"),
      );
    } catch (cause) {
      if (cause.code === "ENOENT") return false;

      throw cause;
    }
  });

  assert(valid, "Shipped package or skill changes require an @spacemansh/anti-slop changeset.");
}
