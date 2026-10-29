/** A same-site path to land on after sign-in ("/dashboard/card"), or null. Rejects "//host" and full URLs. */
export function safeNext(v?: string | null): string | null {
  return v && /^\/(?!\/)[\w\-/]*$/.test(v) && v.length <= 100 ? v : null;
}
