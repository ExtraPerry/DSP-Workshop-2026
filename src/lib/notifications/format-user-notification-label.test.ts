import { describe, expect, it } from "vitest";
import { formatUserNotificationLabel } from "./format-user-notification-label";

describe("formatUserNotificationLabel", () => {
  it("formats first name and last initial", () => {
    expect(formatUserNotificationLabel("Pierre", "Martin")).toBe("Pierre.M");
  });

  it("returns first name only when last name is missing", () => {
    expect(formatUserNotificationLabel("Pierre", null)).toBe("Pierre");
  });

  it("falls back to email local part", () => {
    expect(formatUserNotificationLabel(null, null, "pierre@school.fr")).toBe(
      "pierre"
    );
  });
});
