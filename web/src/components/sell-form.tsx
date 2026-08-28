"use client";

import { useRouter } from "next/navigation";
import { useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAuction } from "@/lib/api";

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const kits = ["Home", "Away", "Third", "Goalkeeper", "Special"];
const conditions = ["New", "NewWithTags", "Used", "Vintage"];

function defaultAuctionEnd() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  const offset = date.getTime() - date.getTimezoneOffset() * 60_000;
  return new Date(offset).toISOString().slice(0, 16);
}

export function SellForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    setPending(true);

    const playerNumberRaw = String(formData.get("playerNumber") ?? "");
    const imageUrl = String(formData.get("imageUrl") ?? "").trim();
    const league = String(formData.get("league") ?? "").trim();
    const endLocal = String(formData.get("auctionEnd") ?? "");

    try {
      const auction = await createAuction({
        reservePrice: Number(formData.get("reservePrice")),
        seller: String(formData.get("seller")),
        auctionEnd: new Date(endLocal).toISOString(),
        item: {
          club: String(formData.get("club")),
          playerName: String(formData.get("playerName")),
          playerNumber: playerNumberRaw ? Number(playerNumberRaw) : undefined,
          season: String(formData.get("season")),
          size: String(formData.get("size")),
          color: String(formData.get("color")),
          kitType: String(formData.get("kitType")),
          condition: String(formData.get("condition")),
          league: league || undefined,
          imageUrl: imageUrl || undefined,
        },
      });
      router.push(`/auctions/${auction.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "The kit man refused the card.");
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="reveal delay-2 border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Your peg name" name="seller" required placeholder="kitvault" />
        <Field label="Club" name="club" required placeholder="Arsenal" />
        <Field label="Player" name="playerName" required placeholder="Bukayo Saka" />
        <Field label="Number" name="playerNumber" type="number" min={0} max={99} placeholder="7" />
        <Field label="Season" name="season" required placeholder="2024/25" />
        <Field label="Color" name="color" required placeholder="Red" />
        <NativeSelect label="Size" name="size" options={sizes} />
        <NativeSelect label="Kit" name="kitType" options={kits} />
        <NativeSelect label="Condition" name="condition" options={conditions} />
        <Field label="Reserve €" name="reservePrice" type="number" min={0} required placeholder="140" />
        <Field label="League" name="league" placeholder="Premier League" />
        <Field label="Hammer time" name="auctionEnd" type="datetime-local" required defaultValue={defaultAuctionEnd()} />
        <div className="md:col-span-2">
          <Field label="Photograph URL" name="imageUrl" placeholder="https://" />
        </div>
      </div>

      {error ? (
        <p className="mt-4 border border-[var(--cardinal)] px-3 py-2 text-sm text-[var(--cardinal)]">{error}</p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="mt-8 h-11 w-full rounded-none border border-[var(--line)] bg-[var(--line)] font-[family-name:var(--font-teko)] text-xs tracking-[0.28em] text-[var(--pitch)] uppercase"
      >
        {pending ? "Coming on…" : "Sub on"}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  ...props
}: ComponentProps<typeof Input> & { label: string; name: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name} className="font-[family-name:var(--font-teko)] text-[10px] tracking-[0.22em] uppercase">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        className="h-11 rounded-none border-[var(--border)] bg-transparent font-[family-name:var(--font-teko)]"
        {...props}
      />
    </div>
  );
}

function NativeSelect({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name} className="font-[family-name:var(--font-teko)] text-[10px] tracking-[0.22em] uppercase">
        {label}
      </Label>
      <select
        id={name}
        name={name}
        required
        className="h-11 rounded-none border border-[var(--border)] bg-transparent px-2.5 font-[family-name:var(--font-teko)] text-sm"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-[var(--pitch)]">
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
