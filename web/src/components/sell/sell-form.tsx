"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useAuth } from "@/components/auth";
import { FormBanner, SelectField, TextField, bindStringField } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { useCreateAuctionMutation } from "@/lib/query/hooks";
import { conditions, kits, sellFieldsSchema, sizes, toCreateAuctionPayload, type SellFields } from "@/lib/validation";

function defaultAuctionEnd() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  const offset = date.getTime() - date.getTimezoneOffset() * 60_000;
  return new Date(offset).toISOString().slice(0, 16);
}

export function SellForm() {
  const router = useRouter();
  const { user } = useAuth();
  const create = useCreateAuctionMutation();
  const [banner, setBanner] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
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
    } as SellFields,
    validators: {
      onChange: sellFieldsSchema,
      onSubmit: sellFieldsSchema,
    },
    onSubmit: async ({ value }) => {
      setBanner(null);
      try {
        const auction = await create.mutateAsync(toCreateAuctionPayload(value));
        router.push(`/auctions/${auction.id}`);
        router.refresh();
      } catch (err) {
        setBanner(err instanceof Error ? err.message : "The kit man refused the card.");
      }
    },
  });

  return (
    <form
      noValidate
      className="ticket reveal delay-2 p-6 md:p-8"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <p className="md:col-span-2 font-[family-name:var(--font-teko)] text-xl tracking-[0.16em] text-[var(--line)]">
          Shirt hangs under {user?.displayName || user?.username}
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
          {(field) => <TextField field={bindStringField(field)} label="Reserve €" placeholder="140" />}
        </form.Field>
        <form.Field name="league">
          {(field) => <TextField field={bindStringField(field)} label="League" placeholder="Premier League" />}
        </form.Field>
        <form.Field name="auctionEnd">
          {(field) => <TextField field={bindStringField(field)} label="Final whistle" type="datetime-local" />}
        </form.Field>
        <form.Field name="imageUrl">
          {(field) => (
            <TextField field={bindStringField(field)} label="Shirt photo" placeholder="https://" className="md:col-span-2" />
          )}
        </form.Field>
      </div>

      <FormBanner message={banner} />

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting || create.isPending}
            className="mt-8 h-11 w-full rounded-none border border-[var(--line)] bg-[var(--line)] font-[family-name:var(--font-teko)] text-2xl tracking-[0.14em] text-[var(--pitch)] uppercase"
          >
            {isSubmitting || create.isPending ? "Coming on…" : "Sub on"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
