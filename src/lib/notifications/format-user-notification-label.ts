/**
 * Short display label for notifications: first_name + "." + last name initial.
 * Example: Pierre Martin → "Pierre.M"
 */
export function formatUserNotificationLabel(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email?: string | null
): string {
  const trimmedFirstName = firstName?.trim();
  const trimmedLastName = lastName?.trim();

  if (trimmedFirstName && trimmedLastName) {
    return `${trimmedFirstName}.${trimmedLastName.charAt(0).toUpperCase()}`;
  }
  if (trimmedFirstName) return trimmedFirstName;
  if (trimmedLastName) {
    return `.${trimmedLastName.charAt(0).toUpperCase()}`;
  }
  if (email) return email.split("@")[0] ?? "Unknown";
  return "Unknown";
}
