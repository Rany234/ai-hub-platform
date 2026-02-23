/**
 * Shared utilities for scripts to ensure environment consistency.
 */
const path = require('path');
const fs = require('fs');

function setupEnv() {
  // Force all scripts to load ONLY .env.local
  // (Do not fall back to .env or default dotenv behavior)
  // Use absolute path so scripts work regardless of current working directory
  const envPath = path.resolve(process.cwd(), '.env.local');
  require('dotenv').config({ path: envPath });
}

function getDbInfo(url) {
  try {
    if (!url) return null;
    const u = new URL(url);
    return {
      host: u.hostname,
      port: u.port,
      db: u.pathname?.replace(/^\//, ''),
      schema: u.searchParams.get('schema') || 'public',
    };
  } catch {
    return null;
  }
}

function printDbInfo() {
  const url = process.env.DATABASE_URL;
  const info = getDbInfo(url);
  if (info) {
    console.log('--- Database Information ---');
    console.log(`Host:   ${info.host}`);
    console.log(`Port:   ${info.port}`);
    console.log(`DB:     ${info.db}`);
    console.log(`Schema: ${info.schema}`);
    if (info.port !== '5433') {
      console.warn('[WARN] You are NOT using the standard local port 5433.');
    }
    console.log('----------------------------');
  } else {
    console.error('[FAIL] Could not parse DATABASE_URL.');
  }
}

module.exports = {
  setupEnv,
  getDbInfo,
  printDbInfo
};
