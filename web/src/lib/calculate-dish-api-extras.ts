import type { CalculateDishApiResponse, CalculateDishApiError } from "./calculate-dish";

export async function saveDishCalculation(
  description: string,
  result: CalculateDishApiResponse, // Need the raw API response for saving
  options?: { accessToken?: string | null; language?: "pl" | "en" },
): Promise<{ data: { calculation_id: string } } | { error: CalculateDishApiError }> {
  const accessToken = options?.accessToken;
  const language = options?.language ?? "pl";
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string;
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

  if (!supabaseUrl || !anonKey) {
    return { error: { error: "internal_error", message: "Missing Supabase config" } };
  }

  if (!accessToken) {
    return { error: { error: "invalid_token", message: "Must be logged in to save" } };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: anonKey,
    Authorization: `Bearer ${accessToken}`,
  };

  const response = await fetch(
    `${supabaseUrl}/functions/v1/save-dish-calculation`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ description, result, language }),
    },
  );

  const body = (await response.json().catch(() => ({}))) as any;

  if (!response.ok) {
    return {
      error: {
        error: body.error || "internal_error",
        message: body.message,
      },
    };
  }

  return { data: { calculation_id: body.calculation_id } };
}