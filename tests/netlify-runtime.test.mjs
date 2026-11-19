import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { onPostBuild, onPreBuild } from "../netlify/plugins/verify-next-runtime/index.js";

const utils = {
  build: {
    failBuild(message) {
      throw new Error(message);
    },
  },
};

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "metre-netlify-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const functionsDir = join(root, "functions");
  const publishDir = join(root, "publish");
  mkdirSync(functionsDir);
  mkdirSync(join(publishDir, "_next", "static"), { recursive: true });

  const zipPath = join(functionsDir, "___netlify-server-handler.zip");
  writeFileSync(zipPath, "bundled function");
  const server = {
    name: "___netlify-server-handler",
    generator: "@netlify/plugin-nextjs@5.16.8",
    path: zipPath,
    routes: [{ expression: "^(?:\\/(.*))\\/?$", methods: [] }],
  };
  const writeManifest = (functions = [server]) => {
    writeFileSync(join(functionsDir, "manifest.json"), JSON.stringify({ functions }));
  };
  writeManifest();

  return {
    context: { constants: { FUNCTIONS_DIST: functionsDir, PUBLISH_DIR: publishDir }, utils },
    functionsDir,
    publishDir,
    server,
    writeManifest,
    zipPath,
  };
}

test("Netlify configuration explicitly installs the adapter before the verification plugin", () => {
  const config = readFileSync(new URL("../netlify.toml", import.meta.url), "utf8");
  const adapter = config.indexOf('package = "@netlify/plugin-nextjs"');
  const verifier = config.indexOf('package = "./netlify/plugins/verify-next-runtime"');
  assert.ok(adapter !== -1 && verifier > adapter);
  assert.match(config, /publish\s*=\s*"\.next"/);
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.ok(pkg.devDependencies["@netlify/plugin-nextjs"]);
});

test("accepts a bundled Next.js function with routes and deployable static assets", (t) => {
  const { context } = fixture(t);
  assert.doesNotThrow(() => onPostBuild(context));
});

test("rejects a missing or malformed functions manifest", (t) => {
  const { context, functionsDir } = fixture(t);
  const manifest = join(functionsDir, "manifest.json");
  rmSync(manifest);
  assert.throws(() => onPostBuild(context), /manifest is missing or invalid/);
  writeFileSync(manifest, "not JSON");
  assert.throws(() => onPostBuild(context), /manifest is missing or invalid/);
  writeFileSync(manifest, "null");
  assert.throws(() => onPostBuild(context), /Next\.js server function is missing/);
});

test("rejects other functions in place of the Next.js runtime", (t) => {
  const { context, server, writeManifest } = fixture(t);
  writeManifest([{ ...server, generator: "some-other-plugin@1.0.0" }]);
  assert.throws(() => onPostBuild(context), /Next\.js server function is missing/);
});

test("rejects a function that was not actually bundled", (t) => {
  const { context, zipPath } = fixture(t);
  rmSync(zipPath);
  assert.throws(() => onPostBuild(context), /Next\.js server function is missing/);
});

test("rejects missing or incorrect routes and HTTP methods", (t) => {
  const { context, server, writeManifest } = fixture(t);
  server.routes = [{ expression: "^/$", methods: ["GET"] }];
  writeManifest();
  assert.throws(() => onPostBuild(context), /no GET route for \/calculator/);
  server.routes = [{ expression: "^/.*$", methods: ["POST"] }];
  writeManifest();
  assert.throws(() => onPostBuild(context), /no GET route for \//);
  server.routes = [{ expression: "^/.*$", methods: ["GET"] }];
  writeManifest();
  assert.throws(() => onPostBuild(context), /no POST route for \/api\/estimate/);
  server.routes = [{ expression: "^/(?:|calculator|api/(?:health|estimate))$", methods: [] }];
  writeManifest();
  assert.throws(() => onPostBuild(context), /no GET route for \/report\/deploy-check/);
  server.routes = [{ expression: "[", methods: [] }];
  writeManifest();
  assert.throws(() => onPostBuild(context), /no GET route for \//);
});

test("rejects raw Next.js output instead of adapted publish assets", (t) => {
  const { context, publishDir } = fixture(t);
  rmSync(join(publishDir, "_next"), { recursive: true });
  assert.throws(() => onPostBuild(context), /publish directory does not contain/);
});

test("fails before building if the runtime was explicitly disabled", () => {
  const original = process.env.NETLIFY_NEXT_PLUGIN_SKIP;
  try {
    for (const value of ["true", "1"]) {
      process.env.NETLIFY_NEXT_PLUGIN_SKIP = value;
      assert.throws(() => onPreBuild({ utils }), /NETLIFY_NEXT_PLUGIN_SKIP/);
    }
    delete process.env.NETLIFY_NEXT_PLUGIN_SKIP;
    assert.doesNotThrow(() => onPreBuild({ utils }));
  } finally {
    if (original === undefined) delete process.env.NETLIFY_NEXT_PLUGIN_SKIP;
    else process.env.NETLIFY_NEXT_PLUGIN_SKIP = original;
  }
});
