"use client";

import { useEffect, useState } from "react";

export function KickTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShow(window.scrollY > 420);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function goUp() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      className="kick-top"
      data-show={show ? "true" : "false"}
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      aria-label="Back to the top"
      onClick={goUp}
    >
      <span className="kick-top-kicker">Rail</span>
      <span className="kick-top-mark">Top</span>
    </button>
  );
}
