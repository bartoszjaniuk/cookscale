import en from "../../../shared/locales/en.json";
import pl from "../../../shared/locales/pl.json";

type Lang = "en" | "pl";

const locales = { en, pl } as const;

export type PageName = "home" | "calculator" | "ai" | "history" | "login";

export const getPageMeta = (
  lang: Lang,
  page: PageName,
): {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  robots?: string;
} => {
  const p = locales[lang].PAGES;

  switch (page) {
    case "home":
      return {
        title: p.META_HOME_TITLE,
        description: p.META_HOME_DESC,
      };
    case "calculator":
      return {
        title: p.META_CALCULATOR_TITLE,
        description: p.META_CALCULATOR_DESC,
      };
    case "ai":
      return {
        title: p.META_AI_TITLE,
        description: p.META_AI_DESC,
      };
    case "history":
      return {
        title: p.META_HISTORY_TITLE,
        description: p.META_HISTORY_DESC,
      };
    case "login":
      return {
        title: p.META_LOGIN_TITLE,
        description: p.META_LOGIN_DESC,
        ogTitle: p.META_LOGIN_OG_TITLE,
        ogDescription: p.META_LOGIN_OG_DESC,
        robots: "noindex, follow",
      };
  }
};
