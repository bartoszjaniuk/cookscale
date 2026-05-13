import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ColorTheme } from "@/types/theme";
import { TranslationFunction } from "./ai-calculator";

const COLOR_KEY = "cookscale-color-theme";

const getThemes = (
  t: TranslationFunction,
): { id: ColorTheme; label: string; swatch: string }[] => [
  { id: "emerald", label: t("THEME.EMERALD"), swatch: "oklch(0.45 0.099 165)" },
  { id: "amber", label: t("THEME.AMBER"), swatch: "oklch(0.56 0.18 55)" },
  { id: "sky", label: t("THEME.SKY"), swatch: "oklch(0.50 0.17 232)" },
  { id: "rose", label: t("THEME.ROSE"), swatch: "oklch(0.53 0.21 355)" },
];

export function applyColorTheme(theme: ColorTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.colorTheme = theme;
}

export function ThemePicker() {
  const { t } = useTranslation();
  const [active, setActive] = useState<ColorTheme>("emerald");
  const [mounted, setMounted] = useState(false);
  const themes = getThemes(t);

  useEffect(() => {
    const saved =
      (localStorage.getItem(COLOR_KEY) as ColorTheme | null) ?? "emerald";
    setActive(saved);
    applyColorTheme(saved);
    setMounted(true);
  }, []);

  const select = (theme: ColorTheme) => {
    setActive(theme);
    localStorage.setItem(COLOR_KEY, theme);
    applyColorTheme(theme);
  };

  if (!mounted) {
    return <div aria-hidden className="w-[116px] h-9" />;
  }

  return (
    <div
      className="inline-flex items-center gap-1 p-1 rounded-full"
      style={{
        border: "1px solid var(--color-border)",
        background: "var(--color-card)",
      }}
      role="group"
      aria-label={t("THEME.LABEL")}
    >
      {themes.map(({ id, label, swatch }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => select(id)}
            aria-label={label}
            aria-pressed={isActive}
            title={label}
            className="w-6 h-6 rounded-full transition-all"
            style={{
              background: swatch,
              outline: isActive
                ? `2px solid ${swatch}`
                : "2px solid transparent",
              outlineOffset: "2px",
              transform: isActive ? "scale(1.15)" : "scale(1)",
            }}
          />
        );
      })}
    </div>
  );
}
