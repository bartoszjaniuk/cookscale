/// <reference types="astro/client" />

import type { User, SupabaseClient } from "@supabase/supabase-js";

declare global {
  namespace App {
    interface Locals {
      user: User | null;
      supabase: SupabaseClient;
    }
  }
}
