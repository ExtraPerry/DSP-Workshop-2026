/**
 * Resolves notification title/body for display. Admin broadcasts store plain
 * text in title_key/body_key. System notifications may store keys under the
 * Notifications.* namespace when those entries exist in messages.
 */
export function resolveNotificationText(
  key: string,
  translateNotification?: (subKey: string) => string
): string {
  if (!key) return "";
  if (key.startsWith("Notifications.") && translateNotification) {
    const subKey = key.slice("Notifications.".length);
    try {
      return translateNotification(subKey);
    } catch {
      return key;
    }
  }
  return key;
}
