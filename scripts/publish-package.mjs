import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

// Only the release action on the fork's main branch can publish.
assert.equal(process.env.GITHUB_REPOSITORY, "tonyedgal/anti-slop");

assert.equal(process.env.GITHUB_EVENT_NAME, "push");

assert.equal(process.env.GITHUB_REF, "refs/heads/main");

assert(
  !readdirSync(".changeset").some((file) => file.endsWith(".md") && file !== "README.md"),
  "Merge the Changesets version pull request before publishing.",
);

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  assert.ifError(result.error);
  assert.equal(result.status, 0, `${command} failed`);
}

run("pnpm", ["exec", "changeset", "pack", "--out-dir", ".release/packed"]);

const packed = JSON.parse(readFileSync(".release/packed/publish-plan.json", "utf8"));

for (const group of packed.plan) {
  for (const release of group) {
    if (release.kind !== "publish") continue;

    assert.equal(release.name, "@spacemansh/anti-slop");
    const tarball = resolve(".release/packed", release.tarball.path);
    run(process.execPath, ["scripts/check-package.mjs", tarball]);
    const integrity = `sha256-${createHash("sha256").update(readFileSync(tarball)).digest("base64")}`;
    assert.equal(
      integrity,
      release.tarball.integrity,
      "The verified artifact changed after packing.",
    );
    assert(
      !release.version.includes("-") || release.tag !== "latest",
      "Prereleases must not use latest.",
    );
  }
}

// Publish the already-tested bytes using the version and tag in the packed plan.
run("pnpm", ["exec", "changeset", "publish", "--from-pack-dir", ".release/packed"]);
