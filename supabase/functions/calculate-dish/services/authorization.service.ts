import { getSupabaseAdmin } from "../lib/supabase-admin.ts";
import type { AppLanguage, AuthContext } from "../types.ts";

export class AuthorizationService {
  private supabase = getSupabaseAdmin();

  async getAuthContext(
    authHeader: string | null,
    requestLanguage: AppLanguage,
  ): Promise<AuthContext> {
    if (!authHeader) {
      return {
        userId: null,
        isPremium: false,
        premiumExpiresAt: null,
        trialAiUsedAt: null,
        preferredLanguage: requestLanguage,
      };
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await this.supabase.auth.getUser(token);

    if (error || !user) {
      throw new Error("invalid_token");
    }

    const { data: profile, error: profileError } = await this.supabase
      .from("profiles")
      .select("is_premium, premium_expires_at, trial_ai_used_at, preferred_language")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("internal_error");
    }

    const preferredLanguage: AppLanguage =
      profile.preferred_language === "en" ? "en" : "pl";

    return {
      userId: user.id,
      isPremium: profile.is_premium,
      premiumExpiresAt: profile.premium_expires_at,
      trialAiUsedAt: profile.trial_ai_used_at,
      preferredLanguage,
    };
  }

  async checkAccess(authContext: AuthContext, ipHash: string): Promise<void> {
    const { userId, isPremium, premiumExpiresAt, trialAiUsedAt } = authContext;

    if (!userId) {
      // Anonymous trial: 1 call per IP
      const { count, error } = await this.supabase
        .from("ai_usage_log")
        .select("*", { count: "exact", head: true })
        .eq("ip_hash", ipHash)
        .eq("success", true);

      if (error) {
        console.error("Error checking anonymous trial:", error);
        throw new Error("internal_error");
      }

      if (count && count >= 1) {
        throw new Error("trial_exhausted");
      }
      return;
    }

    // Premium check
    const isPremiumActive = isPremium && (!premiumExpiresAt || new Date(premiumExpiresAt) > new Date());
    if (isPremiumActive) {
      return;
    }

    // Authenticated Free trial: 1 call per user
    if (trialAiUsedAt !== null) {
      throw new Error("premium_required");
    }
  }
}
