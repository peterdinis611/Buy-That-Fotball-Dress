import type { ReactNode } from "react";
import Link from "next/link";
import { JerseyBack } from "@/components/jersey-back";
import type { KitListing } from "@/lib/types";

const XI = [
  { n: "01", x: "11%", y: "50%" },
  { n: "02", x: "26%", y: "16%" },
  { n: "05", x: "24%", y: "36%" },
  { n: "04", x: "24%", y: "64%" },
  { n: "03", x: "26%", y: "84%" },
  { n: "08", x: "48%", y: "28%" },
  { n: "06", x: "46%", y: "50%" },
  { n: "10", x: "48%", y: "72%" },
  { n: "07", x: "74%", y: "22%" },
  { n: "09", x: "80%", y: "50%" },
  { n: "11", x: "74%", y: "78%" },
];

export function PitchBoard({
  listings = [],
  overlay,
}: {
  listings?: KitListing[];
  overlay?: ReactNode;
}) {
  return (
    <div className="pitch-stage">
      <div className="flood-beam flood-beam-tl" />
      <div className="flood-beam flood-beam-tr" />
      <div className="stands" />

      <div className="pitch-face">
        <svg className="pitch-lines" viewBox="0 0 1050 680" preserveAspectRatio="none" aria-hidden>
          <rect x="24" y="24" width="1002" height="632" fill="none" stroke="#eef6ea" strokeWidth="4" />
          <line x1="525" y1="24" x2="525" y2="656" stroke="#eef6ea" strokeWidth="3" />
          <circle cx="525" cy="340" r="92" fill="none" stroke="#eef6ea" strokeWidth="3" />
          <circle cx="525" cy="340" r="7" fill="#eef6ea" />
          <rect x="24" y="170" width="165" height="340" fill="none" stroke="#eef6ea" strokeWidth="3" />
          <rect x="24" y="248" width="72" height="184" fill="none" stroke="#eef6ea" strokeWidth="3" />
          <circle cx="189" cy="340" r="6" fill="#eef6ea" />
          <path d="M189 278 A78 78 0 0 1 189 402" fill="none" stroke="#eef6ea" strokeWidth="3" />
          <rect x="861" y="170" width="165" height="340" fill="none" stroke="#eef6ea" strokeWidth="3" />
          <rect x="954" y="248" width="72" height="184" fill="none" stroke="#eef6ea" strokeWidth="3" />
          <circle cx="861" cy="340" r="6" fill="#eef6ea" />
          <path d="M861 278 A78 78 0 0 0 861 402" fill="none" stroke="#eef6ea" strokeWidth="3" />
          <path d="M24 24 Q48 48 24 72" fill="none" stroke="#eef6ea" strokeWidth="3" />
          <path d="M1026 24 Q1002 48 1026 72" fill="none" stroke="#eef6ea" strokeWidth="3" />
          <path d="M24 656 Q48 632 24 608" fill="none" stroke="#eef6ea" strokeWidth="3" />
          <path d="M1026 656 Q1002 632 1026 608" fill="none" stroke="#eef6ea" strokeWidth="3" />
        </svg>

        <div className="pitch-ball" />

        {XI.map((spot, index) => {
          const listing = listings[index];
          const shirt = (
            <JerseyBack
              number={listing?.playerNumber?.toString().padStart(2, "0") ?? spot.n}
              color={listing?.color ?? "chalk"}
              ghost={!listing}
              className="h-[72px] w-[62px] md:h-[92px] md:w-[80px]"
              style={{ animationDelay: `${index * 180}ms` }}
            />
          );

          return (
            <div
              key={spot.n}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: spot.x, top: spot.y }}
            >
              {listing ? (
                <Link href={`/auctions/${listing.id}`} className="kit-hover block" title={listing.playerName}>
                  {shirt}
                </Link>
              ) : (
                shirt
              )}
            </div>
          );
        })}

        {overlay}
      </div>
    </div>
  );
}
