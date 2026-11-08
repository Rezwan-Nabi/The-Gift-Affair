export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { data?: undefined } : { data: T }))
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

type DbError = { code?: string; message?: string } | null | undefined;

/** Turns a database error into a message an editor can act on, without leaking internals. */
export function dbErrorResult(error: DbError, what: string): { ok: false; message: string; fieldErrors?: Record<string, string> } {
  console.error(`[admin] ${what}:`, error?.code, error?.message);
  switch (error?.code) {
    case "23505":
      return { ok: false, message: "That URL slug is already used. Choose a different one.", fieldErrors: { slug: "Already used by another item." } };
    case "42501":
      return { ok: false, message: "Your account doesn't have permission to do this. Ask an admin to check your role." };
    case "23503":
      return { ok: false, message: "One of the selected categories, tags or gifts no longer exists. Reload the page and try again." };
    case "P0002":
      return { ok: false, message: "This item no longer exists. It may have been deleted by someone else." };
    case "23514":
      return { ok: false, message: "Some details don't meet the content rules. Check the highlighted fields and try again." };
    default:
      return { ok: false, message: `Couldn't save the ${what}. Try again in a moment.` };
  }
}

export function zodFieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const key = i.path.map(String).join(".");
    if (key && !out[key]) out[key] = i.message;
  }
  return out;
}
