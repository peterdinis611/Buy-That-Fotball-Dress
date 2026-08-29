export function Floodlights() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[2]" aria-hidden>
      <div className="fluor-tube mx-auto w-[min(1100px,92%)]" />
      <div className="mx-auto h-24 w-[min(1100px,92%)] bg-[radial-gradient(ellipse_at_top,rgb(255_255_255/0.45),transparent_70%)]" />
    </div>
  );
}
