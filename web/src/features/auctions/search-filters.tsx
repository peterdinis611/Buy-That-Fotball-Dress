"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SearchQuery } from "@/lib/types";

const sizes = ["", "XS", "S", "M", "L", "XL", "XXL"].map((value) => ({
  value,
  label: value || "Any",
}));

const kits = ["", "Home", "Away", "Third", "Goalkeeper", "Special"].map((value) => ({
  value,
  label: value || "Any",
}));

export function SearchFilters({ query }: { query: SearchQuery }) {
  const router = useRouter();
  const active = Boolean(query.club || query.playerName || query.size || query.kitType);

  function update(name: string, value: string) {
    const params = new URLSearchParams();
    const next = {
      club: query.club ?? "",
      playerName: query.playerName ?? "",
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
    <form className="board-slam mb-10 overflow-hidden" onSubmit={(event) => event.preventDefault()}>
      <div className="sub-board">
        <div className="sub-board-bib flex items-center justify-between gap-4 px-5 py-2 text-lg">
          <span>Filter the rail</span>
          {active ? (
            <button
              type="button"
              onClick={() => router.push("/search")}
              className="font-[family-name:var(--font-display)] text-base tracking-[0.12em] uppercase underline-offset-4 hover:underline"
            >
              Clear
            </button>
          ) : null}
        </div>

        <div className="grid gap-px bg-[#2a2a2a] md:grid-cols-4">
          <BoardInput
            label="Club"
            value={query.club ?? ""}
            placeholder="Arsenal"
            onChange={(value) => update("club", value)}
          />
          <BoardInput
            label="Player"
            value={query.playerName ?? ""}
            placeholder="Saka"
            onChange={(value) => update("playerName", value)}
          />
          <BoardSelect
            label="Size"
            value={query.size ?? ""}
            options={sizes}
            onChange={(value) => update("size", value)}
          />
          <BoardSelect
            label="Kit"
            value={query.kitType ?? ""}
            options={kits}
            onChange={(value) => update("kitType", value)}
          />
        </div>
      </div>
    </form>
  );
}

function BoardInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={`board-bay ${value ? "board-bay-lit" : ""}`}>
      <span className="board-bay-label">{label}</span>
      <input
        defaultValue={value}
        placeholder={placeholder}
        onBlur={(event) => onChange(event.target.value.trim())}
        onKeyDown={(event) => {
          if (event.key === "Enter") onChange(event.currentTarget.value.trim());
        }}
        className="board-bay-control"
      />
    </label>
  );
}

function BoardSelect({
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
  const items = options.map((option) => ({
    value: option.value || "any",
    label: option.label,
  }));

  return (
    <div className={`board-bay ${value ? "board-bay-lit" : ""}`}>
      <span className="board-bay-label">{label}</span>
      <Select
        value={value || "any"}
        onValueChange={(next) => onChange(!next || next === "any" ? "" : next)}
        items={items}
      >
        <SelectTrigger className="board-bay-select h-11 w-full min-w-0 rounded-none border-0 bg-transparent px-0 py-0 text-left font-[family-name:var(--font-display)] text-2xl tracking-[0.06em] text-[var(--chalk)] uppercase shadow-none ring-0 outline-none focus-visible:border-transparent focus-visible:ring-0 data-[size=default]:h-11 data-popup-open:text-[var(--bib)] [&_svg]:size-5 [&_svg]:text-[var(--bib)]">
          <SelectValue placeholder="Any" />
        </SelectTrigger>
        <SelectContent
          align="start"
          alignItemWithTrigger={false}
          sideOffset={6}
          className="board-select-menu min-w-44 rounded-none border border-[#2a2a2a] bg-[#141414] p-0 text-[#f3f1ec] shadow-[0_22px_50px_rgb(16_32_63/0.4)] ring-0"
        >
          {items.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="rounded-none px-4 py-2.5 font-[family-name:var(--font-display)] text-xl tracking-[0.08em] text-[#f3f1ec] uppercase focus:bg-[var(--bib)] focus:text-[var(--stud)] data-highlighted:bg-[var(--bib)] data-highlighted:text-[var(--stud)]"
            >
              {option.value === "Live" ? (
                <span className="inline-flex items-center gap-2">
                  <span className="live-dot size-1.5 rounded-full bg-[var(--led)]" />
                  {option.label}
                </span>
              ) : (
                option.label
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
