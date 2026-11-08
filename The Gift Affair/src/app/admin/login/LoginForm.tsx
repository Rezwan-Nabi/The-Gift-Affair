"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export default function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} noValidate className="mt-6 space-y-5 rounded-[var(--radius-card)] bg-surface p-6 ring-1 ring-plum-line md:p-8">
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label htmlFor="email" className="mb-1.5 block font-semibold">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          defaultValue={state.email}
          required
          className="field"
          aria-invalid={!!fe.email}
          aria-describedby={fe.email ? "email-error" : undefined}
        />
        {fe.email && (
          <p id="email-error" className="mt-1.5 text-sm font-medium text-danger">
            {fe.email}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block font-semibold">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field"
          aria-invalid={!!fe.password}
          aria-describedby={fe.password ? "password-error" : undefined}
        />
        {fe.password && (
          <p id="password-error" className="mt-1.5 text-sm font-medium text-danger">
            {fe.password}
          </p>
        )}
      </div>
      {state.message && (
        <p role="alert" className="rounded-lg bg-danger/8 px-3 py-2 text-sm font-medium text-danger">
          {state.message}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
