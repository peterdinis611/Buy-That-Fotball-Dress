import type { CSSProperties } from "react";

export function kitColors(color: string) {
  const value = color.toLowerCase();

  if (value.includes("yellow")) return { fill: "#ffdf00", number: "#0b1d12", stripe: "#0b1d12" };
  if (value.includes("pink")) return { fill: "#f4b6c8", number: "#1a1a1a", stripe: "#ffffff" };
  if (value.includes("white") && value.includes("blue")) return { fill: "#e8eef6", number: "#0033a0", stripe: "#0033a0" };
  if (value.includes("blue") && value.includes("red")) return { fill: "#a50044", number: "#ffd200", stripe: "#004d98" };
  if (value.includes("white")) return { fill: "#f4f1ea", number: "#0b1d12", stripe: "#c8102e" };
  if (value.includes("red")) return { fill: "#c8102e", number: "#ffffff", stripe: "#ffffff" };
  if (value.includes("blue")) return { fill: "#0033a0", number: "#ffffff", stripe: "#ffffff" };
  if (value.includes("black")) return { fill: "#161616", number: "#ffffff", stripe: "#f5c400" };
  if (value.includes("green")) return { fill: "#0b7a3b", number: "#ffffff", stripe: "#ffffff" };

  return { fill: "#f4f1ea", number: "#0b1d12", stripe: "#c8102e" };
}

export function JerseyBack({
  number,
  color = "chalk",
  ghost = false,
  className = "",
  style,
}: {
  number: string;
  color?: string;
  ghost?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const kit = kitColors(color);
  const fill = ghost ? "transparent" : kit.fill;
  const stroke = ghost ? "#eef6ea" : "rgba(0,0,0,0.22)";
  const numeral = ghost ? "#eef6ea" : kit.number;

  return (
    <svg
      className={`jersey-svg ${ghost ? "jersey-ghost" : "jersey-live"} ${className}`}
      viewBox="0 0 140 160"
      style={style}
      aria-hidden
    >
      <path
        d="M28 28 L48 28 L58 10 L82 10 L92 28 L112 28 L132 52 L118 62 L118 150 L22 150 L22 62 L8 52 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={ghost ? 2.4 : 1.4}
      />
      {!ghost ? (
        <>
          <path d="M22 78 H118" stroke={kit.stripe} strokeWidth="10" opacity="0.85" />
          <path d="M58 10 L70 28 L82 10" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="3" />
        </>
      ) : (
        <path d="M58 10 L70 28 L82 10" fill="none" stroke="#eef6ea" strokeWidth="2" opacity="0.7" />
      )}
      <text
        x="70"
        y="118"
        textAnchor="middle"
        fill={numeral}
        fontSize="64"
        fontWeight="700"
        opacity={ghost ? 0.55 : 1}
      >
        {number}
      </text>
    </svg>
  );
}
