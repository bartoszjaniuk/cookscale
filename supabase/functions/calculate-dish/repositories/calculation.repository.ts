import { getSupabaseAdmin } from "../lib/supabase-admin.ts";
import type { CalculationsInsert, AiUsageLogInsert, CalculateDishResponse } from "../types.ts";

export class CalculationRepository {
  private supabase = getSupabaseAdmin();

  async saveCalculation(
    userId: string,
    description: string,
    llmIngredients: any[],
    result: CalculateDishResponse
  ): Promise<string> {
    const calculation: CalculationsInsert = {
      user_id: userId,
      type: "dish",
      input_text: description,
      input: { description, llm_ingredients: llmIngredients },
      result: {
        total_weight_g: result.total_weight_g,
        total: result.total,
        per_100g: result.per_100g,
        items: result.items,
      },
      warnings: result.warnings || null,
    };

    const { data, error } = await this.supabase
      .from("calculations")
      .insert(calculation)
      .select("id")
      .single();

    if (error || !data) {
      console.error("Error saving calculation:", error);
      throw new Error("internal_error");
    }

    return data.id;
  }

  async markTrialUsed(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("profiles")
      .update({ trial_ai_used_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      console.error("Error updating trial_ai_used_at:", error);
      throw new Error("internal_error");
    }
  }

  async logAiUsage(ipHash: string, userId: string | null, success: boolean): Promise<void> {
    const log: AiUsageLogInsert = {
      ip_hash: ipHash,
      user_id: userId,
      success,
    };

    const { error } = await this.supabase
      .from("ai_usage_log")
      .insert(log);

    if (error) {
      console.error("Error logging AI usage:", error);
      // We don't throw here to not fail the request if logging fails after success
    }
  }
}
