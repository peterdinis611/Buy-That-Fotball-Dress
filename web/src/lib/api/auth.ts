import { getToken } from "@/lib/auth";
import type { AuthUser, RegisterPayload } from "@/lib/types";
import { apiBase, authHeaders, readError } from "./client";

export async function login(username: string, password: string) {
  const response = await fetch(`${apiBase()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return (await response.json()) as AuthUser;
}

export async function register(payload: RegisterPayload) {
  const response = await fetch(`${apiBase()}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return (await response.json()) as AuthUser;
}

export async function getMe() {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`${apiBase()}/api/auth/me`, {
    headers: authHeaders(),
    cache: "no-store",
  });

  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Identity is offline.");
  return (await response.json()) as AuthUser;
}
