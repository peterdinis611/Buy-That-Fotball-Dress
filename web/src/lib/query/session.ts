import { getMe } from "@/lib/api";
import { clearSession, getStoredUser, persistSession } from "@/lib/auth";

export async function loadSession() {
  try {
    const current = await getMe();
    if (current) {
      persistSession(current);
      return current;
    }
    clearSession();
    return null;
  } catch {
    return getStoredUser();
  }
}
