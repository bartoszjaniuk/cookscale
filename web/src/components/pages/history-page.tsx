import { useTranslation } from "react-i18next";
import { format, isToday, isYesterday } from "date-fns";
import { pl, enUS } from "date-fns/locale";

export type HistoryRow = {
  id: string;
  type: string;
  name: string;
  meta: string;
  kcal: number | null;
  when: string;
};

type Props = {
  rows: HistoryRow[];
};

export function HistoryPage({ rows }: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "pl" ? pl : enUS;

  const formatWhen = (iso: string) => {
    const d = new Date(iso);
    if (isToday(d))
      return `${t("HISTORY.TODAY")}, ${format(d, "HH:mm", { locale })}`;
    if (isYesterday(d))
      return `${t("HISTORY.YESTERDAY")}, ${format(d, "HH:mm", { locale })}`;
    return format(d, "d MMM, HH:mm", { locale });
  };

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-5 md:px-8 py-8 md:py-16">
      <p
        className="text-[13px] uppercase tracking-widest"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {t("HISTORY.TITLE")}
      </p>
      <h1 className="mt-2 md:mt-3">{t("PAGES.HISTORY_HEADING")}</h1>
      <p
        className="mt-3 md:mt-4 text-[15px] md:text-[16px] max-w-2xl"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {t("PAGES.HISTORY_DESC")}
      </p>

      {rows.length === 0 ? (
        <div
          className="mt-10 rounded-3xl px-5 md:px-8 py-10 md:py-14 text-center"
          style={{ background: "var(--color-secondary)" }}
        >
          <p className="font-serif text-[22px]">{t("PAGES.HISTORY_EMPTY")}</p>
          <p
            className="mt-2 text-[15px]"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {t("PAGES.HISTORY_EMPTY_DESC")}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/calculator" className="btn-primary">
              {t("PAGES.HISTORY_CTA_CALCULATOR")}
            </a>
            <a href="/ai" className="btn-outline">
              {t("PAGES.HISTORY_CTA_AI")}
            </a>
          </div>
        </div>
      ) : (
        <ul className="mt-10 space-y-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className="card-soft px-4 md:px-6 py-4 md:py-5 flex items-center justify-between gap-3 md:gap-4"
            >
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <span
                  className="w-10 h-10 shrink-0 rounded-full grid place-items-center text-[18px]"
                  style={{
                    background:
                      row.type === "dish"
                        ? "var(--color-primary-light)"
                        : "var(--color-secondary)",
                  }}
                >
                  {row.type === "dish" ? "🍝" : "🥩"}
                </span>
                <div className="min-w-0">
                  <p className="font-serif text-[18px] md:text-[20px] truncate">
                    {row.name}
                  </p>
                  <p
                    className="text-[13px]"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {row.meta}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                {row.kcal != null && (
                  <p
                    className="text-[16px]"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {row.kcal} kcal
                  </p>
                )}
                <p
                  className="text-[12px]"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  {formatWhen(row.when)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
