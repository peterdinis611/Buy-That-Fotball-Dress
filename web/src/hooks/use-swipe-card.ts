"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

export type SwipeDir = "left" | "right";

const THRESHOLD = 108;
const VELOCITY = 0.45;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useSwipeCard({
  cardId,
  enabled,
  onCommit,
}: {
  cardId: string | undefined;
  enabled: boolean;
  onCommit: (dir: SwipeDir) => void;
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [exit, setExit] = useState<SwipeDir | null>(null);
  const [dragging, setDragging] = useState(false);
  const origin = useRef({ x: 0, y: 0, t: 0 });
  const live = useRef({ x: 0, y: 0 });
  const active = useRef(false);
  const locked = useRef(false);
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  useEffect(() => {
    setOffset({ x: 0, y: 0 });
    setExit(null);
    setDragging(false);
    live.current = { x: 0, y: 0 };
    active.current = false;
    locked.current = false;
  }, [cardId]);

  const fling = useCallback(
    (dir: SwipeDir) => {
      if (!enabled || locked.current || !cardId) return;
      locked.current = true;
      active.current = false;
      setDragging(false);
      setExit(dir);
      const ms = prefersReducedMotion() ? 0 : 320;
      window.setTimeout(() => {
        onCommitRef.current(dir);
        setOffset({ x: 0, y: 0 });
        setExit(null);
        live.current = { x: 0, y: 0 };
        locked.current = false;
      }, ms);
    },
    [enabled, cardId],
  );

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (!enabled || locked.current || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    origin.current = { x: event.clientX, y: event.clientY, t: performance.now() };
    live.current = { x: 0, y: 0 };
    active.current = true;
    setDragging(true);
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (!active.current || locked.current) return;
    live.current = {
      x: event.clientX - origin.current.x,
      y: event.clientY - origin.current.y,
    };
    setOffset(live.current);
  }

  function onPointerUp() {
    if (!active.current || locked.current) return;
    active.current = false;
    setDragging(false);
    const { x } = live.current;
    const dt = Math.max(1, performance.now() - origin.current.t);
    const vx = x / dt;
    if (Math.abs(x) > THRESHOLD || Math.abs(vx) > VELOCITY) {
      fling(x > 0 ? "right" : "left");
      return;
    }
    setOffset({ x: 0, y: 0 });
    live.current = { x: 0, y: 0 };
  }

  const passHint = exit === "left" ? 1 : Math.min(1, Math.max(0, -offset.x / THRESHOLD));
  const watchHint = exit === "right" ? 1 : Math.min(1, Math.max(0, offset.x / THRESHOLD));

  const style =
    exit || (!dragging && offset.x === 0 && offset.y === 0)
      ? undefined
      : {
          transform: `translate(${offset.x}px, ${offset.y}px) rotate(${offset.x / 18}deg)`,
          transition: dragging ? "none" : "transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)",
        };

  return {
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
    dragging,
    exit,
    fling,
    passHint,
    watchHint,
    style,
  };
}
