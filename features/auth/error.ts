export function getFriendlyAuthErrorMessage(error: string | undefined) {
  if (!error) return undefined;

  // If backend accidentally returns raw JSON (e.g. Zod issues), extract a friendly message.
  try {
    const parsed = JSON.parse(error) as unknown;

    if (Array.isArray(parsed) && parsed.length > 0) {
      const first = parsed[0] as Record<string, unknown>;
      const msg = first.message;
      if (typeof msg === "string" && msg.trim().length > 0) return msg;
    }

    if (
      parsed &&
      typeof parsed === "object" &&
      "issues" in parsed &&
      Array.isArray((parsed as Record<string, unknown>).issues)
    ) {
      const issues = (parsed as Record<string, unknown>).issues as unknown[];
      const first = issues[0] as Record<string, unknown> | undefined;
      const msg = first?.message;
      if (typeof msg === "string" && msg.trim().length > 0) return msg;
    }
  } catch {
    // Not JSON
  }

  return error;
}
