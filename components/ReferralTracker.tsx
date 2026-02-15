"use client";

import { useEffect } from "react";

const COOKIE_NAME = "affiliate_ref";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  const encoded = encodeURIComponent(value);
  document.cookie = `${name}=${encoded}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

export function ReferralTracker() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (!ref) return;

      setCookie(COOKIE_NAME, ref, MAX_AGE_SECONDS);
    } catch {
      // noop
    }
  }, []);

  return null;
}
