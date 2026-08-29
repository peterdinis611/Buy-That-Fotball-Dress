"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import { register } from "@/lib/api";
import { queryKeys } from "@/lib/query";
import type { RegisterPayload } from "@/lib/types";

function signInError(code?: string) {
  if (code === "invalid_credentials") return "Wrong username or password.";
  return "Sign in failed. Check the name and password.";
}

async function signInWithPassword(username: string, password: string) {
  const result = await signIn("credentials", {
    username,
    password,
    redirect: false,
  });

  if (!result) throw new Error("Sign in failed.");
  if (result.error) throw new Error(signInError(result.code));
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      signInWithPassword(username, password),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.auctions.sheet() });
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      await register(payload);
      await signInWithPassword(payload.username, payload.password);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.auctions.sheet() });
    },
  });
}
