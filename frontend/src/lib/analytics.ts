import { api, apiPublic } from "./api";
import { getToken } from "./auth";

export async function trackEvent(
  eventType: string,
  opts?: { token?: string; userId?: number; metadata?: Record<string, unknown> }
): Promise<void> {
  const body = {
    event_type: eventType,
    token: opts?.token,
    user_id: opts?.userId,
    metadata: opts?.metadata,
  };
  try {
    if (getToken()) {
      await api.post("/api/analytics/track-event", body);
    } else {
      await apiPublic.post("/api/analytics/track-event/public", body);
    }
  } catch {
    /* non-blocking */
  }
}
