import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "@/lib/supabase";

const PROTECTED_ROUTES = ["/history"];
const AUTH_ROUTES = ["/login"];

const SUPPORTED_LANGUAGES = ["pl", "en"] as const;
type Language = (typeof SUPPORTED_LANGUAGES)[number];

const detectLanguage = (
  request: Request,
  cookies: { get: (name: string) => { value: string } | undefined },
): Language => {
  const cookie = cookies.get("app_language")?.value?.toLowerCase();
  if (cookie && SUPPORTED_LANGUAGES.includes(cookie as Language)) {
    return cookie as Language;
  }
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const primary = acceptLanguage.split(",")[0]?.split("-")[0]?.toLowerCase();
  return SUPPORTED_LANGUAGES.includes(primary as Language)
    ? (primary as Language)
    : "pl";
};

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerClient({
    request: context.request,
    cookies: context.cookies,
  });

  // getUser() validates the JWT with Supabase Auth server — never trust getSession() alone
  const {
    data: { user },
  } = await supabase.auth.getUser();

  context.locals.user = user;
  context.locals.supabase = supabase;
  context.locals.lang = detectLanguage(context.request, context.cookies);

  const pathname = new URL(context.request.url).pathname;

  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r)) && !user) {
    return context.redirect("/login");
  }

  if (AUTH_ROUTES.some((r) => pathname.startsWith(r)) && user) {
    return context.redirect("/history");
  }

  return next();
});
