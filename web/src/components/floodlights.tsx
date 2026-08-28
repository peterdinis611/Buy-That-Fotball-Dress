export function Floodlights() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[2]" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-8%,rgb(255_248_210/0.16),transparent_58%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_0%_0%,rgb(232_255_106/0.07),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_100%_0%,rgb(232_255_106/0.07),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_70%_at_50%_115%,rgb(0_0_0/0.55),transparent_55%)]" />
    </div>
  );
}
