"use client";

import type { MouseEvent, ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";

export function ConfirmAct({
  title,
  body,
  confirmLabel,
  cancelLabel = "Keep",
  pending,
  disabled,
  triggerClassName,
  triggerLabel,
  ariaLabel,
  dataWhistle,
  onConfirm,
  onTriggerClick,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  pending?: boolean;
  disabled?: boolean;
  triggerClassName?: string;
  triggerLabel: ReactNode;
  ariaLabel?: string;
  dataWhistle?: boolean;
  onConfirm: () => void | Promise<unknown>;
  onTriggerClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        type="button"
        disabled={disabled || pending}
        className={triggerClassName}
        aria-label={ariaLabel}
        data-whistle={dataWhistle ? "true" : undefined}
        onClick={onTriggerClick}
      >
        {pending ? <Spinner className="size-3.5" /> : triggerLabel}
      </AlertDialogTrigger>
      <AlertDialogContent className="gap-0 p-0 sm:max-w-md">
        <AlertDialogHeader className="place-items-start px-5 pt-5 text-left">
          <AlertDialogTitle className="font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-[var(--ink)] uppercase">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-[var(--ink)]/70">
            {body}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mx-0 mb-0 border-[var(--ink)]/20 bg-[var(--ground)]">
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction onClick={() => void onConfirm()}>{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
