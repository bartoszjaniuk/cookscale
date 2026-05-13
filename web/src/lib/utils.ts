import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLocaleName(
  locale: string,
  nameEn: string,
  namePl: string | null | undefined,
): string {
  if (locale === "pl" && namePl) {
    return namePl;
  }
  return nameEn;
}
