"use server";

import { mockNotifications } from "../data/notifications.mock";

export async function getMockNotifications() {
  return { notifications: mockNotifications };
}
