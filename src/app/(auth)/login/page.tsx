import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Crown } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AuthForm } from "@/components/forms/auth-form";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(user.onboardingCompleted ? "/dashboard" : "/welcome");
  }

  return (
    <Card className="cinematic-auth-card mx-auto max-w-xl rounded-[2.2rem] border-white/15">
      <CardHeader className="px-7 pt-7">
        <div>
          <Link href="/" className="back-link inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-ink dark:text-slate-400 dark:hover:text-slate-200">
            <ArrowLeft className="h-4 w-4" />
            Back to the home
          </Link>
          <div className="mt-6 flex items-center gap-2">
            <Crown className="h-4 w-4 text-gold/60" />
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold/80">Sign in</p>
          </div>
          <h2 className="mt-3 text-3xl font-semibold text-ink">Step back into the workspace. No noise.</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-7 pb-7">
        <div className="auth-hint-box rounded-[1.75rem] border border-gold/15 bg-gold/5 p-4 text-sm text-slate-600 dark:border-gold/10 dark:bg-gold/[0.03] dark:text-slate-400">
          Demo login is prefilled for speed: <span className="font-semibold text-ink dark:text-gold">demo@invisiblecrm.local / demo12345</span>
        </div>
        <AuthForm mode="login" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          New here?{" "}
          <Link href="/register" className="font-semibold text-ink underline decoration-gold/40 underline-offset-4 dark:text-slate-200 dark:decoration-gold/60">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
