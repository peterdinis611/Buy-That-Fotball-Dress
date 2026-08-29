"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type BoardToast = {
  id: string;
  eyebrow: string;
  title: string;
  detail: string;
  href: string;
};

type Listener = (toasts: BoardToast[]) => void;

let toasts: BoardToast[] = [];
const listeners = new Set<Listener>();
const timers = new Map<string, number>();

function emit() {
  listeners.forEach((listener) => listener(toasts));
}

export function pushBoardToast(toast: BoardToast) {
  if (toasts.some((row) => row.id === toast.id)) return;
  toasts = [toast, ...toasts].slice(0, 3);
  emit();

  if (typeof window === "undefined") return;
  window.clearTimeout(timers.get(toast.id));
  timers.set(
    toast.id,
    window.setTimeout(() => dismissBoardToast(toast.id), 8000),
  );
}

export function dismissBoardToast(id: string) {
  toasts = toasts.filter((row) => row.id !== id);
  if (typeof window !== "undefined") window.clearTimeout(timers.get(id));
  timers.delete(id);
  emit();
}

export function BoardToaster() {
  const [items, setItems] = useState<BoardToast[]>([]);

  useEffect(() => {
    listeners.add(setItems);
    setItems(toasts);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[80] flex w-[min(100%-2rem,22rem)] flex-col gap-3">
      {items.map((toast) => (
        <div
          key={toast.id}
          className="board-toast pointer-events-auto overflow-hidden shadow-[0_22px_50px_rgb(16_32_63_/_0.35)]"
        >
          <div className="sub-board">
            <div className="sub-board-bib flex items-center justify-between gap-3 px-4 py-1.5 text-base">
              <span>{toast.eyebrow}</span>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => dismissBoardToast(toast.id)}
                className="font-[family-name:var(--font-display)] text-lg leading-none"
              >
                ×
              </button>
            </div>
            <Link href={toast.href} className="block px-4 py-3">
              <p className="text-3xl leading-none text-[var(--chalk)]">{toast.title}</p>
              <p className="mt-2 led-num text-xl">{toast.detail}</p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-sm tracking-[0.16em] text-[var(--muted-foreground)] uppercase">
                Open the lot →
              </p>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
