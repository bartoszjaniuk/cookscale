import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { z } from "npm:zod";
import { corsHeaders } from "../calculate-dish/lib/cors.ts";
import { getSupabaseAdmin } from "../calculate-dish/lib/supabase-admin.ts";
import { AuthorizationService } from "../calculate-dish/services/authorization.service.ts";

const SaveDishCalculationSchema = z.object({
  description: z.string().trim().max(3000),
  result: z.any(), // CalculateDishResponse shape
  language: z.enum(["pl", "en"]).optional(),
});

const authService = new AuthorizationService();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const validation = SaveDishCalculationSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(JSON.stringify({ error: "invalid_request", details: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { description, result } = validation.data;
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get Auth Context
    const authContext = await authService.getAuthContext(authHeader, "en");
    if (!authContext.userId) {
      return new Response(JSON.stringify({ error: "invalid_token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getSupabaseAdmin();

    const calculation = {
      user_id: authContext.userId,
      type: "dish",
      input_text: description,
      input: { description, user_edited: true },
      result: {
        total_weight_g: result.total_weight_g,
        total: result.total,
        per_100g: result.per_100g,
        items: result.items,
      },
      warnings: result.warnings || null,
    };

    const { data, error } = await supabase
      .from("calculations")
      .insert(calculation)
      .select("id")
      .single();

    if (error || !data) {
      console.error("Error saving calculation:", error);
      throw new Error("internal_error");
    }

    return new Response(JSON.stringify({ calculation_id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Save dish calculation error:", error);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
