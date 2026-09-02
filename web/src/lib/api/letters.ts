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
