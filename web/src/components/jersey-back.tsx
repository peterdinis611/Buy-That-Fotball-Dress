function kitColors(color: string) {
  const value = color.toLowerCase();

  if (value.includes("yellow")) return { fill: "#ffdf00", number: "#0b1d12" };
  if (value.includes("pink")) return { fill: "#f4b6c8", number: "#1a1a1a" };
  if (value.includes("white") && value.includes("blue")) return { fill: "#e8eef6", number: "#0033a0" };
  if (value.includes("blue") && value.includes("red")) return { fill: "#a50044", number: "#ffd200" };
  if (value.includes("white")) return { fill: "#f4f1ea", number: "#0b1d12" };
  if (value.includes("red")) return { fill: "#c8102e", number: "#ffffff" };
  if (value.includes("blue")) return { fill: "#0033a0", number: "#ffffff" };
  if (value.includes("black")) return { fill: "#161616", number: "#ffffff" };
  if (value.includes("green")) return { fill: "#0b7a3b", number: "#ffffff" };

  return { fill: "#f4f1ea", number: "#0b1d12" };
}

export function JerseyBack({
  number,
  color,
  className = "",
}: {
  number: string;
  color: string;
  className?: string;
}) {
  const kit = kitColors(color);

  return (
    <div className={`jersey ${className}`} style={{ background: kit.fill }} aria-hidden>
      <span
        className="font-[family-name:var(--font-teko)] text-5xl leading-none"
        style={{ color: kit.number }}
      >
        {number}
      </span>
    </div>
  );
}
