type TranslateNotification = (
  subKey: string,
  values?: Record<string, string>
) => string;

/**
 * Resolves notification title/body for display. Admin broadcasts store plain
 * text in title_key/body_key. System notifications may store keys under the
 * Notifications.* namespace when those entries exist in messages.
 */
export function resolveNotificationText(
  key: string,
  translateNotification?: TranslateNotification
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

export function resolveNotificationBody(
  notification: {
    notification_type: string;
    body_key: string;
  },
  translateNotification?: TranslateNotification
): string {
  if (
    notification.notification_type === "DIRECT_MESSAGE" &&
    translateNotification
  ) {
    try {
      return translateNotification("directMessage.body", {
        sender: notification.body_key,
      });
    } catch {
      return notification.body_key;
    }
  }
  return resolveNotificationText(notification.body_key, translateNotification);
}
