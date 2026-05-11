import { useTranslation } from "react-i18next";

export function AnnouncementBar() {
  const { t } = useTranslation();
  return (
    <div
      className="w-full text-center text-[14px] py-2 px-4"
      style={{ background: "var(--color-announcement)" }}
    >
      <span className="mr-2">🔔</span>
      {t("ANNOUNCEMENT.MESSAGE")}
      <a href="/calculator" className="ml-2 underline underline-offset-4">
        {t("ANNOUNCEMENT.CTA")}
      </a>
    </div>
  );
}
