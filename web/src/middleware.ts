import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "@/lib/supabase";

const PROTECTED_ROUTES = ["/history"];
const AUTH_ROUTES = ["/login"];

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

  const pathname = new URL(context.request.url).pathname;

  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r)) && !user) {
    return context.redirect("/login");
  }

  if (AUTH_ROUTES.some((r) => pathname.startsWith(r)) && user) {
    return context.redirect("/history");
  }

  return next();
});
