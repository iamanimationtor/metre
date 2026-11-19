/**
 * Canonical site base URL — works locally and on Netlify.
 * Priority: explicit override > Netlify deploy URL > Netlify site URL > localhost dev.
 * Netlify injects DEPLOY_URL (per-deploy) and URL (production domain) automatically.
 */
export function siteBase(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.DEPLOY_URL ||
    process.env.URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}
