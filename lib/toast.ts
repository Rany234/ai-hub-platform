"use client";

export function toastError(message: string) {
  if (typeof window !== "undefined") {
    // Keep it simple: avoid adding a new UI dependency.
    window.alert(message);
  }
}
