"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { FormBanner, SelectField, TextField, bindStringField } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { useAuth, useCreateAuctionMutation, useUpdateAuctionMutation } from "@/hooks";
import type { Auction } from "@/lib/types";
import {
  conditions,
  kits,
  sellFieldsSchema,
  sizes,
  toCreateAuctionPayload,
  toSellFields,
  toUpdateAuctionPayload,
  type SellFields,
} from "@/lib/validation";

function defaultAuctionEnd() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  const offset = date.getTime() - date.getTimezoneOffset() * 60_000;
  return new Date(offset).toISOString().slice(0, 16);
}

export function SellForm({ auction }: { auction?: Auction }) {
  const router = useRouter();
  const { user } = useAuth();
  const create = useCreateAuctionMutation();
  const update = useUpdateAuctionMutation(auction?.id ?? "");
  const [banner, setBanner] = useState<string | null>(null);
  const editing = Boolean(auction);

  const form = useForm({
    defaultValues: (auction
      ? toSellFields(auction)
      : {
          club: "",
          playerName: "",
          playerNumber: "",
          season: "",
          color: "",
          size: "M",
          kitType: "Home",
          condition: "Used",
          reservePrice: "",
          league: "",
          auctionEnd: defaultAuctionEnd(),
          imageUrl: "",
          match: "",
          matchDate: "",
          opponent: "",
          pitchPhotoUrl: "",
        }) as SellFields,
    validators: {
      onChange: sellFieldsSchema,
      onSubmit: sellFieldsSchema,
    },
    onSubmit: async ({ value }) => {
      setBanner(null);
      try {
        if (auction) {
          const next = await update.mutateAsync(toUpdateAuctionPayload(value));
          router.push(`/auctions/${next.id}`);
        } else {
          const listed = await create.mutateAsync(toCreateAuctionPayload(value));
          router.push(`/auctions/${listed.id}`);
        }
        router.refresh();
      } catch (err) {
        setBanner(err instanceof Error ? err.message : "Could not save this shirt.");
      }
    },
  });

  const pending = create.isPending || update.isPending;

  return (
    <form
      noValidate
      className="ticket board-slam p-6 md:p-8"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <p className="md:col-span-2 font-[family-name:var(--font-display)] text-xl tracking-[0.12em] text-[var(--bib)]">
          {editing ? "Edit listing" : `Listed as ${user?.displayName || user?.username}`}
        </p>
        <form.Field name="club">
          {(field) => <TextField field={bindStringField(field)} label="Club" placeholder="Arsenal" />}
        </form.Field>
        <form.Field name="playerName">
          {(field) => <TextField field={bindStringField(field)} label="Player" placeholder="Bukayo Saka" />}
        </form.Field>
        <form.Field name="playerNumber">
          {(field) => <TextField field={bindStringField(field)} label="Number" placeholder="7" />}
        </form.Field>
        <form.Field name="season">
          {(field) => <TextField field={bindStringField(field)} label="Season" placeholder="2024/25" />}
        </form.Field>
        <form.Field name="color">
          {(field) => <TextField field={bindStringField(field)} label="Color" placeholder="Red" />}
        </form.Field>
        <form.Field name="size">
          {(field) => <SelectField field={bindStringField(field)} label="Size" options={[...sizes]} />}
        </form.Field>
        <form.Field name="kitType">
          {(field) => <SelectField field={bindStringField(field)} label="Kit" options={[...kits]} />}
        </form.Field>
        <form.Field name="condition">
          {(field) => <SelectField field={bindStringField(field)} label="Condition" options={[...conditions]} />}
        </form.Field>
        <form.Field name="reservePrice">
          {(field) => <TextField field={bindStringField(field)} label="Starting price €" placeholder="140" />}
        </form.Field>
        <form.Field name="league">
          {(field) => <TextField field={bindStringField(field)} label="League" placeholder="Premier League" />}
        </form.Field>
        <form.Field name="auctionEnd">
          {(field) => <TextField field={bindStringField(field)} label="Auction ends" type="datetime-local" />}
        </form.Field>
        <form.Field name="imageUrl">
          {(field) => (
            <TextField field={bindStringField(field)} label="Shirt photo" placeholder="https://" className="md:col-span-2" />
          )}
        </form.Field>
        <p className="md:col-span-2 mt-2 font-[family-name:var(--font-display)] text-xl tracking-[0.12em] text-[var(--bib)]">
          On the grass
        </p>
        <p className="md:col-span-2 -mt-2 text-sm text-[var(--ink)]/60">
          Optional. Match, opponent, and date stamp the lot Worn. Pitch photo sits on the ticket.
        </p>
        <form.Field name="match">
          {(field) => <TextField field={bindStringField(field)} label="Match" placeholder="World Cup final" />}
        </form.Field>
        <form.Field name="opponent">
          {(field) => <TextField field={bindStringField(field)} label="Opponent" placeholder="Germany" />}
        </form.Field>
        <form.Field name="matchDate">
          {(field) => <TextField field={bindStringField(field)} label="Match date" type="date" />}
        </form.Field>
        <form.Field name="pitchPhotoUrl">
          {(field) => (
            <TextField field={bindStringField(field)} label="Pitch photo" placeholder="https://" />
          )}
        </form.Field>
      </div>

      <FormBanner message={banner} />

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting || pending}
            className="mt-8 h-11 w-full rounded-none border-0 bg-[var(--bib)] font-[family-name:var(--font-display)] text-2xl tracking-[0.08em] text-[var(--stud)] uppercase"
          >
            {isSubmitting || pending ? "Saving…" : editing ? "Save changes" : "List this shirt"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
