import type { AppLanguage } from "../types.ts";

export function resolveLanguage(
  bodyLanguage: unknown,
  acceptLanguageHeader: string | null,
  profileLanguage?: string | null,
): AppLanguage {
  if (bodyLanguage === "en" || bodyLanguage === "pl") {
    return bodyLanguage;
  }
  if (profileLanguage === "en" || profileLanguage === "pl") {
    return profileLanguage;
  }
  if (acceptLanguageHeader?.toLowerCase().startsWith("en")) {
    return "en";
  }
  return "pl";
}
