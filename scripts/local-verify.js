#!/usr/bin/env node

/**
 * Local-only verification script (no business logic changes)
 *
 * Checks:
 * - Required env vars exist: DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET
 * - In dev, NEXTAUTH_URL must be localhost (otherwise warn and exit non-zero)
 * - Optional: fetch http://localhost:3000/api/auth/session and ensure it responds
 *   (200/401 ok; 500 or network error => non-zero)
 */

const { setupEnv, printDbInfo } = require("./utils");

// Load env from .env.local
setupEnv();
printDbInfo();

const REQUIRED_ENVS = ["DATABASE_URL", "NEXTAUTH_URL", "NEXTAUTH_SECRET"];

function isLocalhostUrl(urlString) {
  try {
    const u = new URL(urlString);
    const host = (u.hostname || "").toLowerCase();
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

function formatMissing(missing) {
  return missing.map((k) => `- ${k}`).join("\n");
}

async function checkSessionEndpoint() {
  const url = "http://localhost:3000/api/auth/session";

  // Node 18+ has global fetch; if missing, treat as not available.
  if (typeof fetch !== "function") {
    console.log("[SKIP] fetch is not available in this Node runtime; skipping session endpoint check.");
    return { ok: true, skipped: true };
  }

  try {
    const res = await fetch(url, { method: "GET" });
    if (res.status === 500) {
      console.error(`[FAIL] session endpoint returned 500: ${url}`);
      return { ok: false, status: res.status };
    }

    if (res.status === 200 || res.status === 401) {
      console.log(`[OK] session endpoint reachable (${res.status}): ${url}`);
      return { ok: true, status: res.status };
    }

    console.log(`[WARN] session endpoint returned ${res.status} (accepted: 200/401, rejected: 500): ${url}`);
    return { ok: true, status: res.status, warn: true };
  } catch (e) {
    console.error(`[FAIL] session endpoint not reachable: ${url}`);
    console.error(String(e?.message || e));
    return { ok: false, error: e };
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const shouldCheckSession = args.has("--check-session");

  const missing = REQUIRED_ENVS.filter((k) => {
    const v = process.env[k];
    return !v || String(v).trim() === "";
  });

  if (missing.length > 0) {
    console.error("[FAIL] Missing required env vars:");
    console.error(formatMissing(missing));
    process.exit(1);
  }

  console.log("[OK] env OK");

  // Dev constraint: NEXTAUTH_URL must be localhost.
  // Heuristic: if NODE_ENV is not 'production' OR we are running next dev.
  const isDev = (process.env.NODE_ENV || "development") !== "production";

  if (isDev && !isLocalhostUrl(process.env.NEXTAUTH_URL)) {
    console.error(
      `[WARN] NEXTAUTH_URL must be localhost in dev. Current: ${process.env.NEXTAUTH_URL}`
    );
    process.exit(2);
  }

  if (shouldCheckSession) {
    const result = await checkSessionEndpoint();
    if (!result.ok) process.exit(3);
  } else {
    console.log('[SKIP] session endpoint check skipped (pass --check-session to enable).');
  }

  process.exit(0);
}

main();
