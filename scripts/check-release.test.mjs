import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function run(cwd, command, args, expected = 0) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  assert.ifError(result.error);
  assert.equal(result.status, expected, `${result.stdout}\n${result.stderr}`);

  return result.stdout.trim();
}

test("skill-only changes require a changeset and advance the shared version", () => {
  const cwd = mkdtempSync(join(tmpdir(), "anti-slop-release-"));
  mkdirSync(join(cwd, ".changeset"));
  mkdirSync(join(cwd, "skills"));
  writeFileSync(
    join(cwd, "package.json"),
    JSON.stringify({ name: "@spacemansh/anti-slop", version: "0.1.2" }),
  );
  writeFileSync(
    join(cwd, ".changeset/config.json"),
    readFileSync(join(root, ".changeset/config.json")),
  );
  writeFileSync(join(cwd, "skills/SKILL.md"), "Original skill\n");

  const git = (...args) =>
    run(cwd, "git", [
      "-c",
      "user.name=Release Test",
      "-c",
      "user.email=test@example.invalid",
      ...args,
    ]);

  git("init", "-b", "main");
  // Changesets creates annotated tags through its own Git process.
  git("config", "user.name", "Release Test");
  git("config", "user.email", "test@example.invalid");
  git("add", ".");
  git("commit", "-m", "baseline");
  const base = git("rev-parse", "HEAD");
  writeFileSync(join(cwd, "skills/SKILL.md"), "Updated skill\n");
  git("add", ".");
  git("commit", "-m", "update skill");
  run(cwd, process.execPath, [join(root, "scripts/check-changeset.mjs"), base], 1);
  writeFileSync(
    join(cwd, ".changeset/skill.md"),
    '---\n"@spacemansh/anti-slop": patch\n---\n\nUpdate the skill.\n',
  );
  git("add", ".");
  git("commit", "-m", "add changeset");
  run(cwd, process.execPath, [join(root, "scripts/check-changeset.mjs"), base]);
  run(cwd, join(root, "node_modules/.bin/changeset"), ["version"]);
  assert.equal(JSON.parse(readFileSync(join(cwd, "package.json"), "utf8")).version, "0.1.3");
  assert.match(readFileSync(join(cwd, "CHANGELOG.md"), "utf8"), /Update the skill/);
  assert.equal(readFileSync(join(cwd, "skills/SKILL.md"), "utf8"), "Updated skill\n");
  git("add", ".");
  git("commit", "-m", "release");
  run(cwd, join(root, "node_modules/.bin/changeset"), ["git-tag"]);
  const tag = git("tag", "--list");
  assert.match(tag, /0\.1\.3$/);
  assert.equal(git("show", `${tag}:skills/SKILL.md`), "Updated skill");
});

test("contributor documentation alone does not require a release", () => {
  const cwd = mkdtempSync(join(tmpdir(), "anti-slop-docs-"));

  const git = (...args) =>
    run(cwd, "git", [
      "-c",
      "user.name=Release Test",
      "-c",
      "user.email=test@example.invalid",
      ...args,
    ]);

  git("init", "-b", "main");
  writeFileSync(join(cwd, "CONTRIBUTING.md"), "Before\n");
  git("add", ".");
  git("commit", "-m", "baseline");
  const base = git("rev-parse", "HEAD");
  writeFileSync(join(cwd, "CONTRIBUTING.md"), "After\n");
  git("add", ".");
  git("commit", "-m", "docs");
  run(cwd, process.execPath, [join(root, "scripts/check-changeset.mjs"), base]);
});

test("publication refuses local and other repository execution before running commands", () => {
  for (const repository of ["", "example/anti-slop"]) {
    const result = spawnSync(process.execPath, [join(root, "scripts/publish-package.mjs")], {
      encoding: "utf8",
      env: {
        ...process.env,
        GITHUB_REPOSITORY: repository,
        GITHUB_EVENT_NAME: "workflow_dispatch",
        GITHUB_REF: "refs/heads/main",
        RELEASE_ENABLED: "true",
      },
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /AssertionError/);
    assert.equal(result.stdout, "");
  }
});
