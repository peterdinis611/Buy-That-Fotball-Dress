import { getToken } from "@/lib/auth";

const SERVER_API = process.env.API_URL ?? "http://localhost:5027";
const CLIENT_API = process.env.NEXT_PUBLIC_API_URL ?? "/gateway";

export function apiBase() {
  return typeof window === "undefined" ? SERVER_API : CLIENT_API;
}

export function authHeaders(json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function readError(response: Response) {
  const body = await response.text();
  try {
    const json = JSON.parse(body) as { title?: string; errors?: Record<string, string[]> };
    if (json.errors) {
      return Object.values(json.errors).flat().join(" ");
    }
    return json.title ?? body;
  } catch {
    return body || response.statusText;
  }
}
