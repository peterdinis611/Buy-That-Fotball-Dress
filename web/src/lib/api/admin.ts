import { apiBase, authHeaders, readError } from "./client";
import type { ClipMark, OfficeBoard, PegCard, SquadCard, TillCard } from "@/lib/types";

async function officeGet<T>(path: string) {
  const response = await fetch(`${apiBase()}/api/admin/${path}`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  if (response.status === 401) throw new Error("Sign in first.");
  if (response.status === 403) throw new Error("This tunnel is for match officials.");
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as T;
}

export function getOfficeBoard() {
  return officeGet<OfficeBoard>("board");
}

export function getOfficeSquad() {
  return officeGet<SquadCard[]>("squad");
}

export function getOfficePegs() {
  return officeGet<PegCard[]>("pegs");
}

export function getOfficeTills() {
  return officeGet<TillCard[]>("tills");
}

export function getOfficeClip() {
  return officeGet<ClipMark[]>("clip");
}

export async function scratchPeg(id: string) {
  const response = await fetch(`${apiBase()}/api/admin/pegs/${id}/scratch`, {
    method: "POST",
    headers: authHeaders(),
  });

  if (response.status === 401) throw new Error("Sign in first.");
  if (response.status === 403) throw new Error("This tunnel is for match officials.");
  if (!response.ok) throw new Error(await readError(response));
}

export async function verifyPeg(id: string) {
  const response = await fetch(`${apiBase()}/api/admin/pegs/${id}/verify`, {
    method: "POST",
    headers: authHeaders(),
  });

  if (response.status === 401) throw new Error("Sign in first.");
  if (response.status === 403) throw new Error("This tunnel is for match officials.");
  if (!response.ok) throw new Error(await readError(response));
}

export async function whistleTill(id: string) {
  const response = await fetch(`${apiBase()}/api/admin/tills/${id}/whistle`, {
    method: "POST",
    headers: authHeaders(),
  });

  if (response.status === 401) throw new Error("Sign in first.");
  if (response.status === 403) throw new Error("This tunnel is for match officials.");
  if (!response.ok) throw new Error(await readError(response));
}
