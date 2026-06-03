import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "./lib/cors.ts";
import { CalculateDishRequestSchema } from "./schemas.ts";
import { CalculateDishService } from "./services/calculate-dish.service.ts";
import { hashIp } from "./lib/ip-hash.ts";
import { resolveLanguage } from "./lib/resolve-language.ts";

const service = new CalculateDishService();

Deno.serve(async (req) => {
  // CORS preflight
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

    // Parse body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate request
    const validation = CalculateDishRequestSchema.safeParse(body);
    if (!validation.success) {
      const issue = validation.error.issues[0];
      return new Response(JSON.stringify({ error: issue.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { description, language: bodyLanguage } = validation.data;

    // Get IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") || "unknown";
    const ipHash = await hashIp(ip);

    // Get Auth Header
    const authHeader = req.headers.get("Authorization");
    const language = resolveLanguage(
      bodyLanguage,
      req.headers.get("Accept-Language"),
    );

    // Process
    const result = await service.process(
      { description, userId: null, ipHash, language },
      authHeader,
    );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Endpoint error:", error);
    
    let status = 500;
    let errorResponse: any = { error: "internal_error" };

    if (error.message === "rate_limit_exceeded") {
      status = 429;
      errorResponse = { error: "rate_limit_exceeded", reset_at: error.reset_at };
    } else if (error.message === "trial_exhausted" || error.message === "premium_required") {
      status = 403;
      errorResponse = { error: error.message };
    } else if (error.message === "invalid_token") {
      status = 401;
      errorResponse = { error: "invalid_token" };
    } else if (error.message === "ai_service_error") {
      status = 502;
      errorResponse = { error: "ai_service_error" };
    }

    return new Response(JSON.stringify(errorResponse), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
