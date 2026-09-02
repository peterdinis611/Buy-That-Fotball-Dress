import type { BoardLetter } from "@/lib/types";
import { apiBase, authHeaders, readError } from "./client";

export async function getMyLetters() {
  const response = await fetch(`${apiBase()}/api/letters`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (response.status === 401) throw new Error("Sign in first.");
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as BoardLetter[];
}

export async function readLetter(id: string) {
  const response = await fetch(`${apiBase()}/api/letters/${id}/read`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (response.status === 401) throw new Error("Sign in first.");
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as BoardLetter;
}

export async function readAllLetters() {
  const response = await fetch(`${apiBase()}/api/letters/read`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (response.status === 401) throw new Error("Sign in first.");
  if (!response.ok && response.status !== 204) throw new Error(await readError(response));
}
