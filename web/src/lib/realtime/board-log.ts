"use client";

import { useEffect, useState } from "react";

export type BoardEventKind = "bid" | "outbid" | "listed" | "ended" | "won" | "shipped" | "paid";

export type BoardEvent = {
  id: string;
  kind: BoardEventKind;
  eyebrow: string;
  title: string;
  detail: string;
  href: string;
  at: number;
  unread: boolean;
};

type Listener = (events: BoardEvent[]) => void;

const KEY = "kit-vault-board-log";
const MAX = 24;

let events: BoardEvent[] = [];
let hydrated = false;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener(events));
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) events = JSON.parse(raw) as BoardEvent[];
  } catch {
    events = [];
  }
}

function persist() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(events));
}

export function pushBoardEvent(event: Omit<BoardEvent, "unread" | "at"> & { at?: number }) {
  hydrate();
  if (events.some((row) => row.id === event.id)) return;
  events = [
    { ...event, at: event.at ?? Date.now(), unread: true },
    ...events,
  ].slice(0, MAX);
  persist();
  emit();
}

export function markBoardRead() {
  hydrate();
  if (!events.some((row) => row.unread)) return;
  events = events.map((row) => ({ ...row, unread: false }));
  persist();
  emit();
}

export function unreadBoardCount(items = events) {
  return items.filter((row) => row.unread).length;
}

export function useBoardLog() {
  const [items, setItems] = useState<BoardEvent[]>([]);

  useEffect(() => {
    hydrate();
    listeners.add(setItems);
    setItems(events);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  return items;
}
