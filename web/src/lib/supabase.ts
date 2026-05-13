import {
  createBrowserClient,
  createServerClient,
  parseCookieHeader,
} from "@supabase/ssr";
import type { AstroCookies } from "astro";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables: PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY must be set.",
  );
}

/**
 * Browser-side client — stores session in cookies so the server can read it.
 * Use in React components (client:load / client:only).
 */
export const createSupabaseBrowserClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey);

/**
 * Server-side client — reads session from request cookies, writes refreshed
 * tokens back to response cookies via Astro's cookies API.
 * Use in Astro pages (.astro frontmatter) and middleware.
 */
export const createSupabaseServerClient = (context: {
  request: Request;
  cookies: AstroCookies;
}) =>
  createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        const parsed = parseCookieHeader(
          context.request.headers.get("Cookie") ?? "",
        );
        return parsed.map((c) => ({ name: c.name, value: c.value ?? "" }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          context.cookies.set(name, value, options),
        );
      },
    },
  });
