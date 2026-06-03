import { getSupabaseAdmin } from "../lib/supabase-admin.ts";

export class RateLimitService {
  private supabase = getSupabaseAdmin();

  async cleanupOldLogs(): Promise<void> {
    // Lazy cleanup: DELETE FROM ai_usage_log WHERE called_at < now() - interval '48h'
    // Since we can't easily do `now() - interval '48h'` via standard supabase-js delete,
    // we can calculate the date in JS and use `.lt('called_at', date)`
    const date = new Date();
    date.setHours(date.getHours() - 48);
    
    await this.supabase
      .from("ai_usage_log")
      .delete()
      .lt("called_at", date.toISOString());
  }

  async checkRateLimit(ipHash: string): Promise<{ allowed: boolean; resetAt?: string }> {
    const date = new Date();
    date.setHours(date.getHours() - 24);

    const { data, error } = await this.supabase
      .from("ai_usage_log")
      .select("called_at")
      .eq("ip_hash", ipHash)
      .gt("called_at", date.toISOString())
      .order("called_at", { ascending: true });

    if (error) {
      console.error("Error checking rate limit:", error);
      throw new Error("internal_error");
    }

    const count = data?.length || 0;
    if (count >= 20) {
      // Get the oldest log in the 24h window to calculate reset_at
      const oldestLog = data[0];
      const resetAt = new Date(oldestLog.called_at);
      resetAt.setHours(resetAt.getHours() + 24);
      
      return { allowed: false, resetAt: resetAt.toISOString() };
    }

    return { allowed: true };
  }
}
