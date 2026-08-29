"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SearchQuery } from "@/lib/types";

export function SearchFilters({ query }: { query: SearchQuery }) {
  const router = useRouter();

  function update(name: string, value: string) {
    const params = new URLSearchParams();
    const next = {
      club: query.club ?? "",
      playerName: query.playerName ?? "",
      status: query.status ?? "",
      size: query.size ?? "",
      kitType: query.kitType ?? "",
      [name]: value,
    };

    Object.entries(next).forEach(([key, entry]) => {
      if (entry) params.set(key, entry);
    });

    const suffix = params.toString();
    router.push(suffix ? `/search?${suffix}` : "/search");
  }

  return (
    <form
      className="reveal delay-2 mb-10 grid gap-4 bg-[var(--tape)] p-5 md:grid-cols-5"
      onSubmit={(event) => event.preventDefault()}
    >
      <Filter label="Club" value={query.club ?? ""} onChange={(value) => update("club", value)} />
      <Filter
        label="Player"
        value={query.playerName ?? ""}
        onChange={(value) => update("playerName", value)}
      />
      <NativeFilter
        label="Status"
        value={query.status ?? ""}
        options={[
          { value: "", label: "Any" },
          { value: "Live", label: "Live" },
          { value: "Finished", label: "Ended" },
          { value: "ReserveNotMet", label: "Unsold" },
        ]}
        onChange={(value) => update("status", value)}
      />
      <NativeFilter
        label="Size"
        value={query.size ?? ""}
        options={["", "XS", "S", "M", "L", "XL", "XXL"].map((value) => ({
          value,
          label: value || "Any",
        }))}
        onChange={(value) => update("size", value)}
      />
      <NativeFilter
        label="Kit"
        value={query.kitType ?? ""}
        options={["", "Home", "Away", "Third", "Goalkeeper", "Special"].map((value) => ({
          value,
          label: value || "Any",
        }))}
        onChange={(value) => update("kitType", value)}
      />
    </form>
  );
}

function Filter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label className="font-[family-name:var(--font-display)] text-lg tracking-[0.12em] uppercase">
        {label}
      </Label>
      <Input
        defaultValue={value}
        onBlur={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onChange(event.currentTarget.value);
        }}
        className="h-10 rounded-none text-[var(--ink)] placeholder:text-[var(--ink)]/40"
      />
    </div>
  );
}

function NativeFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label className="font-[family-name:var(--font-display)] text-lg tracking-[0.12em] uppercase">
        {label}
      </Label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-none border border-[var(--border)] bg-[var(--tape)] px-2 font-[family-name:var(--font-display)] text-sm text-[var(--ink)]"
      >
        {options.map((option) => (
          <option key={option.value || "any"} value={option.value} className="bg-[var(--tape)]">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
