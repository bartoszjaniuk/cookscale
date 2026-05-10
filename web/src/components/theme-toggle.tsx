import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const KEY = "cookscale-theme";

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as Theme | null) ?? "light";
    setTheme(saved);
    applyTheme(saved);
    setMounted(true);
  }, []);

  const toggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem(KEY, newTheme);
    applyTheme(newTheme);
  };

  // Stable SSR placeholder to avoid hydration mismatch
  if (!mounted) {
    return <div aria-hidden className="w-9 h-9" />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === "light" ? "Przełącz na tryb ciemny" : "Przełącz na tryb jasny"
      }
      className="grid place-items-center w-9 h-9 rounded-lg border transition-colors"
      style={{
        color: "var(--color-foreground)",
        background: "var(--color-secondary)",
        borderColor: "var(--color-border)",
      }}
    >
      {theme === "light" ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
