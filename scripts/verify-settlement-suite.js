#!/usr/bin/env node

/**
 * Settlement Verification Suite (P0-2)
 *
 * Aggregates all settlement related verification tasks.
 * Today it includes:
 * - Hard idempotency regression (verify-settlement-idempotency.js)
 *
 * Usage:
 *   node scripts/verify-settlement-suite.js --cleanup
 * (args are forwarded to underlying scripts)
 */

const { spawnSync } = require("child_process");
const path = require("path");

function runVerify(scriptFile, args) {
  const scriptPath = path.resolve(__dirname, scriptFile);
  console.log(`\n>>> Running: ${scriptFile} ${args.join(" ")}`);

  const cmd = process.platform === "win32" ? "npx.cmd" : "npx";
  const res = spawnSync(cmd, ["tsx", scriptPath, ...args], { 
    stdio: "inherit",
    shell: process.platform === "win32" 
  });

  return res.status ?? 1;
}

function main() {
  console.log("==========================================");
  console.log("   Settlement Verification Suite (P0-2)   ");
  console.log("==========================================");

  const args = process.argv.slice(2);

  const code = runVerify("verify-settlement-idempotency.js", args);
  if (code !== 0) {
    console.error("\n[FAIL] Settlement verification suite failed.");
    process.exit(code);
  }

  console.log("\n==========================================");
  console.log("✅ [ALL PASS] Settlement Suite Complete.");
  console.log("==========================================");
  process.exit(0);
}

main();
