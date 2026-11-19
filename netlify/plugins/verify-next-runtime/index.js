import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The Next.js adapter serves both prerendered pages and dynamic/API routes
// through its server function. Publishing an unadapted .next directory can
// otherwise succeed even though none of those routes exist on Netlify.
const REQUIRED_ROUTES = [
  ["GET", "/"],
  ["GET", "/calculator"],
  ["GET", "/api/health"],
  ["POST", "/api/estimate"],
  ["GET", "/report/deploy-check"],
];

function handlesRoute(route, method, pathname) {
  if (!route || typeof route !== "object") return false;
  if (
    Array.isArray(route.methods) &&
    route.methods.length > 0 &&
    !route.methods.some((allowed) => typeof allowed === "string" && allowed.toUpperCase() === method)
  ) {
    return false;
  }

  if (typeof route.expression !== "string") return false;
  try {
    return new RegExp(route.expression).test(pathname);
  } catch {
    return false;
  }
}

function verifyRuntime({ FUNCTIONS_DIST, PUBLISH_DIR }) {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(join(FUNCTIONS_DIST, "manifest.json"), "utf8"));
  } catch {
    return "The bundled functions manifest is missing or invalid.";
  }

  const functions = Array.isArray(manifest?.functions) ? manifest.functions : [];
  const server = functions.find(
    (fn) =>
      fn && fn.name === "___netlify-server-handler" &&
      typeof fn.generator === "string" &&
      fn.generator.startsWith("@netlify/plugin-nextjs@"),
  );

  if (!server || typeof server.path !== "string" || !existsSync(server.path)) {
    return "The bundled Next.js server function is missing.";
  }

  const routes = Array.isArray(server.routes) ? server.routes : [];
  const missingRoute = REQUIRED_ROUTES.find(
    ([method, pathname]) => !routes.some((route) => handlesRoute(route, method, pathname)),
  );
  if (missingRoute) {
    const [method, pathname] = missingRoute;
    return `The Next.js server function has no ${method} route for ${pathname}.`;
  }

  // At onPostBuild the adapter has swapped the publish directory to its
  // deployable static assets. Raw .next output has no _next/static directory.
  if (!existsSync(join(PUBLISH_DIR, "_next", "static"))) {
    return "The publish directory does not contain the adapted Next.js assets.";
  }

  return null;
}

export function onPreBuild({ utils }) {
  if (["true", "1"].includes(process.env.NETLIFY_NEXT_PLUGIN_SKIP)) {
    utils.build.failBuild(
      "NETLIFY_NEXT_PLUGIN_SKIP disables the Next.js runtime. Remove this variable before deploying.",
    );
  }
}

export function onPostBuild({ constants, utils }) {
  const problem = verifyRuntime(constants);
  if (problem) {
    utils.build.failBuild(
      `${problem} Check that @netlify/plugin-nextjs ran and that the publish directory is .next; do not deploy raw Next.js output.`,
    );
    return;
  }

  console.log("Verified the Next.js server function, application routes, and publish assets.");
}
