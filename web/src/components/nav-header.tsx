import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/theme-toggle";

interface Props {
  currentPath: string;
  isLoggedIn: boolean;
}

export function NavHeader({ currentPath, isLoggedIn }: Props) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("NAVIGATION.START") },
    { href: "/calculator", label: t("NAVIGATION.CALCULATOR") },
    { href: "/ai", label: t("NAVIGATION.AI_MODE") },
    { href: "/history", label: t("NAVIGATION.HISTORY") },
  ];

  const isActive = (href: string) => currentPath === href;

  const authButtons = isLoggedIn ? (
    <a
      href="/api/logout"
      className="btn-ghost hidden sm:inline-flex py-2.5! px-5! text-[14px]!"
    >
      {t("NAVIGATION.SIGN_OUT")}
    </a>
  ) : (
    <>
      <a
        href="/login"
        className="btn-ghost hidden sm:inline-flex py-2.5! px-5! text-[14px]!"
      >
        {t("NAVIGATION.LOGIN")}
      </a>
      <a
        href="/login"
        className="btn-primary hidden sm:inline-flex py-2.5! px-5! text-[14px]!"
      >
        {t("NAVIGATION.SIGN_UP")}
      </a>
    </>
  );

  const mobileAuthButtons = isLoggedIn ? (
    <a
      href="/api/logout"
      className="btn-ghost py-2.5! px-5! text-[14px]! flex-1 text-center"
    >
      {t("NAVIGATION.SIGN_OUT")}
    </a>
  ) : (
    <>
      <a
        href="/login"
        className="btn-ghost py-2.5! px-5! text-[14px]! flex-1 text-center"
      >
        {t("NAVIGATION.LOGIN")}
      </a>
      <a
        href="/login"
        className="btn-primary py-2.5! px-5! text-[14px]! flex-1 text-center"
      >
        {t("NAVIGATION.SIGN_UP")}
      </a>
    </>
  );

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur"
      style={{
        background:
          "color-mix(in oklab, var(--color-background) 80%, transparent)",
      }}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <a href="/" className="flex items-baseline">
          <span className="font-serif text-[26px] leading-none">CookScale</span>
          <span
            className="text-[26px] leading-none"
            style={{ color: "var(--color-primary)" }}
          >
            .
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-[15px] tracking-[-0.01em] transition-colors"
              style={{
                color: isActive(href)
                  ? "var(--color-primary)"
                  : "var(--color-foreground)",
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {authButtons}

          {/* Hamburger */}
          <button
            type="button"
            aria-label={t("NAVIGATION.OPEN_MENU")}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden grid place-items-center w-9 h-9 rounded-lg border transition-colors"
            style={{
              color: "var(--color-foreground)",
              background: "var(--color-secondary)",
              borderColor: "var(--color-border)",
            }}
          >
            {menuOpen ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-background)",
          }}
        >
          <nav className="max-w-6xl mx-auto px-5 py-4 flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-[16px] py-3 px-3 rounded-xl transition-colors"
                style={
                  isActive(href)
                    ? {
                        color: "var(--color-primary)",
                        background: "var(--color-primary-muted)",
                      }
                    : { color: "var(--color-foreground)" }
                }
              >
                {label}
              </a>
            ))}
            <div
              className="flex gap-3 pt-3 mt-1 border-t"
              style={{ borderColor: "var(--color-border)" }}
            >
              {mobileAuthButtons}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
