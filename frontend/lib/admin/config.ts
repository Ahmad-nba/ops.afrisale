/**
 * Operations Console feature configuration.
 *
 * Auth bypass (development aid): when enabled, the admin app skips the backend
 * login/me flow and treats the operator as authenticated. This keeps the entire
 * bypass behind a single toggle in the auth layer — pages, guard and API layer
 * are untouched, so restoring real auth is a one-line change (or just flip the
 * env var).
 *
 * Resolution order:
 *   NEXT_PUBLIC_ADMIN_AUTH_DISABLED="true"  -> bypass ON
 *   NEXT_PUBLIC_ADMIN_AUTH_DISABLED="false" -> bypass OFF (enforce auth)
 *   unset                                    -> bypass in development only
 *
 * The production build (NODE_ENV=production, e.g. Vercel) enforces auth by
 * default so the console is never left open publicly by accident.
 */

export function isAdminAuthDisabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_ADMIN_AUTH_DISABLED;
  if (flag === "true") return true;
  if (flag === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export const DEV_ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ADMIN_DEV_EMAIL || "dev@afrisale.local";
