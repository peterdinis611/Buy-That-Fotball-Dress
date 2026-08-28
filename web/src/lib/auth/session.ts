import type { AuthUser } from "@/lib/types";

const TOKEN_KEY = "kitvault.token";
const USER_KEY = "kitvault.user";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function persistSession(user: AuthUser) {
  if (typeof window === "undefined") return;
  const token = user.token ?? window.localStorage.getItem(TOKEN_KEY);
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify({ ...user, token: undefined }));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
