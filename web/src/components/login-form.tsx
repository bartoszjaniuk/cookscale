import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) return;

    setSubmitting(true);
    setInfo(null);
    setIsError(false);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setSubmitting(false);

    if (error) {
      setIsError(true);
      setInfo("Nieprawidłowy e-mail lub hasło. Spróbuj ponownie.");
      return;
    }

    window.location.href = "/history";
  };

  const loginWithGoogle = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/history` },
    });
  };

  return (
    <div className="card-soft p-7 md:p-10 max-w-md w-full mx-auto">
      <div className="flex items-baseline">
        <span className="font-serif text-[28px]">CookScale</span>
        <span className="text-[28px]" style={{ color: "var(--color-primary)" }}>
          .
        </span>
      </div>
      <h2 className="font-serif text-[28px] mt-6">Zaloguj się</h2>
      <p className="mt-2 text-[14px] text-black/60">
        Nie masz konta?{" "}
        <a
          href="/login"
          className="underline-offset-4 hover:underline"
          style={{ color: "var(--color-primary)" }}
        >
          Załóż w 30 sekund
        </a>
      </p>

      <button
        type="button"
        className="mt-7 w-full inline-flex items-center justify-center gap-3 rounded-full py-3.5 text-[15px] transition-colors"
        style={{
          border: "1px solid var(--color-border)",
          background: "var(--color-card)",
          color: "var(--color-foreground)",
        }}
        onClick={loginWithGoogle}
      >
        <GoogleMark />
        Kontynuuj z Google
      </button>

      <div className="my-6 flex items-center gap-3">
        <span
          className="h-px flex-1"
          style={{ background: "var(--color-border)" }}
        />
        <span className="text-[12px] uppercase tracking-widest text-black/45">
          lub
        </span>
        <span
          className="h-px flex-1"
          style={{ background: "var(--color-border)" }}
        />
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div>
          <label htmlFor="email" className="text-[13px] text-black/60">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ty@przyklad.pl"
            className="input-underline mt-1"
          />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className="text-[13px] text-black/60">
              Hasło
            </label>
            <button
              type="button"
              className="text-[12px] hover:underline underline-offset-4"
              style={{ color: "var(--color-primary)" }}
              onClick={() =>
                setInfo(
                  "Wpisz swój e-mail i kliknij 'Zapomniałeś?' — link do resetu zostanie wysłany.",
                )
              }
            >
              Zapomniałeś?
            </button>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input-underline mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full disabled:opacity-50"
        >
          {submitting ? "Logowanie…" : "Zaloguj się"}
        </button>

        {info && (
          <p
            className="text-[13px] text-center rounded-2xl px-4 py-3"
            style={{
              background: isError
                ? "var(--color-destructive)"
                : "var(--color-announcement)",
              color: isError
                ? "var(--color-destructive-foreground)"
                : undefined,
            }}
          >
            {info}
          </p>
        )}

        <p className="text-[12px] text-black/50 text-center">
          Logując się akceptujesz{" "}
          <a className="underline underline-offset-4" href="#">
            Regulamin
          </a>{" "}
          i{" "}
          <a className="underline underline-offset-4" href="#">
            Politykę prywatności
          </a>
          .
        </p>
      </form>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.8 0 19.5-8.7 19.5-19.5 0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 16.3 4.5 9.7 8.6 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 43.5c5.4 0 10.3-2 14-5.3l-6.5-5.5C29.5 34.5 26.9 35.5 24 35.5c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.4 16.2 43.5 24 43.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.5 5.5c-.5.5 7.4-5.4 7.4-15.2 0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
