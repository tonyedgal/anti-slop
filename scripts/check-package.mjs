import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

const oxlintVersion = manifest.devDependencies.oxlint;

const output = join(root, ".release");

mkdirSync(output, { recursive: true });

function run(command, args, cwd, expected = 0) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", env: process.env });
  assert.ifError(result.error);
  assert.equal(
    result.status,
    expected,
    `${command} ${args.join(" ")}\n${result.stdout}\n${result.stderr}`,
  );

  return result.stdout;
}

// Keep the verified tarball available for local consumers and the release job.
if (!process.argv[2]) {
  run("pnpm", ["pack", "--pack-destination", output], root);
}

const tarball = process.argv[2]
  ? resolve(process.argv[2])
  : join(output, `spacemansh-anti-slop-${manifest.version}.tgz`);

const entries = run("tar", ["-tzf", tarball], root).trim().split("\n");

const packedManifest = JSON.parse(run("tar", ["-xOf", tarball, "package/package.json"], root));

assert.equal(packedManifest.name, manifest.name);

assert.equal(packedManifest.version, manifest.version);

for (const path of [
  "dist/index.mjs",
  "dist/effect/index.mjs",
  "dist/config.mjs",
  "LICENSE",
  "docs/UPSTREAM.md",
  "docs/RELEASING.md",
  "packaging/README.md",
  "src/vendor/eslint-stylistic/LICENSE",
  "src/vendor/eslint-stylistic/UPSTREAM.md",
]) {
  assert(entries.includes(`package/${path}`), `Missing packed file: ${path}`);
}

assert(!entries.some((path) => /\.test\.|node_modules|skills\/|IMPLEMENTATION_PLAN/.test(path)));

assert(!entries.some((path) => path.startsWith("package/src/") && path.endsWith(".ts")));

const genericRules = readdirSync(join(root, "src/rules"))
  .filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts"))
  .map((file) => file.slice(0, -3))
  .sort();

const effectRules = readdirSync(join(root, "src/effect/rules"))
  .filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts"))
  .map((file) => file.slice(0, -3))
  .sort();

assert.equal(genericRules.length, 18);

assert.equal(effectRules.length, 5);

for (const manager of ["pnpm", "npm"]) {
  const consumer = mkdtempSync(join(tmpdir(), `anti-slop-${manager}-`));
  writeFileSync(join(consumer, "package.json"), JSON.stringify({ private: true, type: "module" }));

  const dependencies = [
    tarball,
    `oxlint@${oxlintVersion}`,
    `@oxlint/plugins@${oxlintVersion}`,
    "typescript@5.4.5",
  ];

  run(
    manager,
    manager === "pnpm"
      ? ["add", "-D", "--strict-peer-dependencies", ...dependencies]
      : ["install", "--save-dev", "--no-audit", "--no-fund", ...dependencies],
    consumer,
  );
  const nodeModules = join(consumer, "node_modules");
  const lint = (...args) => run(join(nodeModules, ".bin/oxlint"), args, consumer);
  const lintError = (...args) => run(join(nodeModules, ".bin/oxlint"), args, consumer, 1);
  writeFileSync(
    join(consumer, "exports.mjs"),
    `
import assert from "node:assert/strict";
import generic from "@spacemansh/anti-slop";
import effect from "@spacemansh/anti-slop/effect";
import { antiSlopConfig, antiSlopEffectConfig } from "@spacemansh/anti-slop/config";
assert.equal(generic.meta.name, "anti-slop");
assert.equal(effect.meta.name, "anti-slop-effect");
assert.deepEqual(Object.keys(generic.rules).sort(), ${JSON.stringify(genericRules)});
assert.deepEqual(Object.keys(effect.rules).sort(), ${JSON.stringify(effectRules)});
assert.deepEqual(Object.keys(antiSlopConfig.rules).sort(), [...Object.keys(generic.rules).map(name => "anti-slop/" + name), "oxc/no-accumulating-spread"].sort());
assert.deepEqual(Object.keys(antiSlopEffectConfig.rules).sort(), Object.keys(effect.rules).map(name => "anti-slop-effect/" + name).sort());
assert(Object.values(antiSlopConfig.rules).every(value => value === "error"));
assert(Object.values(antiSlopEffectConfig.rules).every(value => value === "error"));
await assert.rejects(import("@spacemansh/anti-slop/src/index.ts"), { code: "ERR_PACKAGE_PATH_NOT_EXPORTED" });
`,
  );
  run(process.execPath, ["exports.mjs"], consumer);
  writeFileSync(
    join(consumer, "oxlint.config.ts"),
    `import { defineConfig } from "oxlint";
import { antiSlopConfig } from "@spacemansh/anti-slop/config";
export default defineConfig({ ...antiSlopConfig });\n`,
  );
  writeFileSync(join(consumer, "valid.ts"), "export const value = 1;\n");
  lint("valid.ts");
  writeFileSync(join(consumer, "invalid.ts"), 'export const value = Reflect.get({}, "value");\n');
  assert.match(lintError("invalid.ts"), /no-reflect-get/);
  writeFileSync(
    join(consumer, "oxlint.config.ts"),
    `import { defineConfig } from "oxlint";
import { antiSlopConfig, antiSlopEffectConfig } from "@spacemansh/anti-slop/config";
export default defineConfig({
  jsPlugins: [...antiSlopConfig.jsPlugins, ...antiSlopEffectConfig.jsPlugins],
  rules: { ...antiSlopConfig.rules, ...antiSlopEffectConfig.rules, "anti-slop/no-reflect-get": "off" },
});\n`,
  );
  lint("invalid.ts");
  writeFileSync(join(consumer, "effect.ts"), 'export const value = { _tag: "Item" };\n');
  assert.match(lintError("effect.ts"), /no-manual-tagged-construction/);
  writeFileSync(
    join(consumer, "spacing.ts"),
    "export const first = 1;\n/** Attached to second. */\nexport const second = 2;\n",
  );
  writeFileSync(
    join(consumer, "spacing-two.ts"),
    "export const third = 3;\nexport const fourth = 4;\n",
  );
  lint("--fix", "spacing.ts", "spacing-two.ts");
  const fixed = readFileSync(join(consumer, "spacing.ts"), "utf8");
  assert.match(fixed, /first = 1;\n\n\/\*\* Attached/);
  lint("--fix", "spacing.ts", "spacing-two.ts");
  assert.equal(readFileSync(join(consumer, "spacing.ts"), "utf8"), fixed);
  run(join(root, "node_modules/.bin/oxfmt"), ["spacing.ts", "spacing-two.ts"], consumer);
  lint("--fix", "spacing.ts", "spacing-two.ts");
  assert.equal(readFileSync(join(consumer, "spacing.ts"), "utf8"), fixed);
  writeFileSync(
    join(consumer, "manual.json"),
    JSON.stringify({
      jsPlugins: [{ name: "anti-slop", specifier: "@spacemansh/anti-slop" }],
      rules: { "anti-slop/no-reflect-get": "error" },
    }),
  );
  assert.match(lintError("--config", "manual.json", "invalid.ts"), /no-reflect-get/);
  writeFileSync(
    join(consumer, "consumer.mts"),
    `import generic from "@spacemansh/anti-slop";
import effect from "@spacemansh/anti-slop/effect";
import { antiSlopConfig, antiSlopEffectConfig } from "@spacemansh/anti-slop/config";
import { defineConfig } from "oxlint";
defineConfig({ ...antiSlopConfig, rules: { ...antiSlopConfig.rules, "anti-slop/no-reflect-get": "off" } });
defineConfig(antiSlopEffectConfig);
void generic.rules;
void effect.rules;\n`,
  );

  for (const [module, moduleResolution] of [
    ["NodeNext", "NodeNext"],
    ["ESNext", "Bundler"],
  ]) {
    run(
      join(nodeModules, ".bin/tsc"),
      [
        "--noEmit",
        "--strict",
        "--skipLibCheck",
        "false",
        "--target",
        "ES2022",
        "--module",
        module,
        "--moduleResolution",
        moduleResolution,
        "consumer.mts",
      ],
      consumer,
    );
  }

  // Verify the contributor compiler against the same installed declarations.
  run(
    join(root, "node_modules/.bin/tsc"),
    [
      "--noEmit",
      "--strict",
      "--skipLibCheck",
      "false",
      "--target",
      "ES2022",
      "--module",
      "NodeNext",
      "--moduleResolution",
      "NodeNext",
      "consumer.mts",
    ],
    consumer,
  );

  console.log(`${manager} consumer passed: ${consumer}`);
}

const checksum = createHash("sha256").update(readFileSync(tarball)).digest("hex");

writeFileSync(
  join(output, "SHA256SUMS"),
  `${checksum}  spacemansh-anti-slop-${manifest.version}.tgz\n`,
);

console.log(`Verified ${tarball}\nSHA256 ${checksum}`);
