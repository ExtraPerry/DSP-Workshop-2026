/**
 * Maps admin server-action codes and legacy English messages to i18n keys
 * under Pages.AdminCommon. Use for toast.error instead of raw error.message.
 */
const ADMIN_ERROR_KEY_BY_CODE: Record<string, string> = {
  NOT_AUTHENTICATED: "error_not_authenticated",
  FORBIDDEN: "error_forbidden",
  USER_NOT_FOUND: "error_user_not_found",
  "Not authenticated": "error_not_authenticated",
  Forbidden: "error_forbidden",
  "User not found": "error_user_not_found",
};

export function formatAdminError(
  error: string | undefined,
  translate: (key: string) => string
): string {
  const key = error ? ADMIN_ERROR_KEY_BY_CODE[error] : undefined;
  if (key) return translate(key);
  return translate("generic_error");
}
