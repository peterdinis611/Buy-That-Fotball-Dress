export function Floodlights() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[2]" aria-hidden>
      <div className="fluor-tube mx-auto w-[min(1100px,92%)]" />
      <div className="flood-cone mx-auto h-24 w-[min(1100px,92%)]" />
    </div>
  );
}
