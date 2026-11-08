import Logo from "@/components/ui/Logo";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;
  return (
    <main id="main" className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Logo />
        <div className="garland mt-6 w-[140px]" aria-hidden="true" />
        <h1 className="mt-6 text-4xl">Sign in to the admin</h1>
        {!isSupabaseConfigured ? (
          <div className="mt-6 rounded-[var(--radius-card)] bg-sunshine-soft p-6">
            <p className="font-semibold">The admin area needs Supabase.</p>
            <p className="mt-2 text-plum/85">
              The public site is running on sample content. Add <code className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to <code className="font-mono text-sm">.env.local</code>,
              run the database migrations and restart the server. The README explains each step.
            </p>
          </div>
        ) : (
          <>
            {error === "access" && (
              <p role="alert" className="mt-6 rounded-xl bg-sunshine-soft px-4 py-3 font-medium">
                Sign in with an editor account to continue.
              </p>
            )}
            <LoginForm next={next} />
          </>
        )}
      </div>
    </main>
  );
}
