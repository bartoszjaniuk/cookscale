import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { z } from "npm:zod";
import { corsHeaders } from "../calculate-dish/lib/cors.ts";
import { getSupabaseAdmin } from "../calculate-dish/lib/supabase-admin.ts";
import { MacroCalculatorService } from "../calculate-dish/services/macro-calculator.service.ts";
import { roundCalculateDishResponse, roundMatchedIngredient } from "../calculate-dish/lib/round-macros.ts";
import type { MatchedIngredient, DishWarning, MacroTotals } from "../calculate-dish/types.ts";

const RecalculateDishRequestSchema = z.object({
  items: z.array(z.object({
    product_id: z.string().uuid().nullable(),
    product_name: z.string(),
    raw_weight_g: z.number().positive(),
    cooking_method_slug: z.enum(["boiling", "frying", "baking", "none"]).nullable(),
    yield_source: z.enum(["db", "ai", "external"]).optional(),
    yield_factor_used: z.number().optional(),
    macros: z.object({
      calories_kcal: z.number(),
      protein_g: z.number(),
      fat_g: z.number(),
      carbs_g: z.number(),
    }).optional(),
  })),
});

const macroCalculatorService = new MacroCalculatorService();

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
    const validation = RecalculateDishRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(JSON.stringify({ error: "invalid_request", details: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { items } = validation.data;
    const supabase = getSupabaseAdmin();

    const matchedIngredients: MatchedIngredient[] = [];
    const warnings: DishWarning[] = [];

    for (const item of items) {
      // Unrecognized item
      if (!item.product_id) {
        if (item.yield_source === "external" && item.macros) {
          // Rebuild external item
          const yieldFactor = item.yield_factor_used || 1.0;
          const extItem: MatchedIngredient = {
            product_id: null,
            product_name: item.product_name,
            cooking_method_slug: item.cooking_method_slug,
            raw_weight_g: item.raw_weight_g,
            cooked_weight_g: item.raw_weight_g * yieldFactor,
            yield_factor_used: yieldFactor,
            yield_source: "external",
            matched_confidence: 0,
            macros: {
              calories_kcal: item.macros.calories_kcal,
              protein_g: item.macros.protein_g,
              fat_g: item.macros.fat_g,
              carbs_g: item.macros.carbs_g,
            },
            nutrition_source: "external",
          };
          matchedIngredients.push(roundMatchedIngredient(extItem));
        } else {
          warnings.push({
            issue: "unrecognized",
            ingredient: item.product_name,
          });
        }
        continue;
      }

      // If method is missing
      if (!item.cooking_method_slug) {
        warnings.push({
          issue: "cooking_method_required",
          ingredient: item.product_name,
        });
        
        // Push with raw macros as fallback, but UI should require method
        const { data: prod } = await supabase.from("products").select("*").eq("id", item.product_id).single();
        if (prod) {
          const k = item.raw_weight_g / 100;
          matchedIngredients.push(roundMatchedIngredient({
            product_id: prod.id,
            product_name: item.product_name,
            cooking_method_slug: null,
            raw_weight_g: item.raw_weight_g,
            cooked_weight_g: item.raw_weight_g,
            yield_factor_used: 1.0,
            yield_source: "db",
            matched_confidence: 1.0,
            macros: {
              calories_kcal: (prod.calories_kcal || 0) * k,
              protein_g: (prod.protein_g || 0) * k,
              fat_g: (prod.fat_g || 0) * k,
              carbs_g: (prod.carbs_g || 0) * k,
            },
          }));
        }
        continue;
      }

      // Standard DB lookup for product and factor
      const { data: prodData } = await supabase
        .from("products")
        .select(`
          id, calories_kcal, protein_g, fat_g, carbs_g,
          product_cooking_factors ( yield_factor, cooking_methods!inner(slug) )
        `)
        .eq("id", item.product_id)
        .single();

      if (!prodData) {
        warnings.push({ issue: "unrecognized", ingredient: item.product_name });
        continue;
      }

      let yieldFactor = 1.0;
      let yieldSource: "db" | "ai" = "db";
      let issue: "yield_source_ai" | undefined;

      if (item.cooking_method_slug === "none") {
        yieldFactor = 1.0;
      } else {
        const factorObj = prodData.product_cooking_factors?.find(
          (f: any) => f.cooking_methods?.slug === item.cooking_method_slug
        );
        if (factorObj) {
          yieldFactor = factorObj.yield_factor;
        } else {
          yieldSource = "ai";
          issue = "yield_source_ai";
          // Try to fallback to any existing factor or 1.0
          const fallback = prodData.product_cooking_factors?.[0];
          if (fallback) {
            yieldFactor = fallback.yield_factor;
          }
        }
      }

      const k = item.raw_weight_g / 100;
      const macros: MacroTotals = {
        calories_kcal: (prodData.calories_kcal || 0) * k,
        protein_g: (prodData.protein_g || 0) * k,
        fat_g: (prodData.fat_g || 0) * k,
        carbs_g: (prodData.carbs_g || 0) * k,
      };

      const matched: MatchedIngredient = {
        product_id: prodData.id,
        product_name: item.product_name,
        cooking_method_slug: item.cooking_method_slug,
        raw_weight_g: item.raw_weight_g,
        cooked_weight_g: item.raw_weight_g * yieldFactor,
        yield_factor_used: yieldFactor,
        yield_source: yieldSource,
        matched_confidence: 1.0,
        macros,
      };

      matchedIngredients.push(roundMatchedIngredient(matched));

      if (issue) {
        warnings.push({
          issue,
          ingredient: item.product_name,
          yield_factor_estimated: yieldFactor,
        });
      }
    }

    const { total_weight_g, total, per_100g } = macroCalculatorService.aggregate(matchedIngredients);

    const response = roundCalculateDishResponse({
      calculation_id: null,
      total_weight_g,
      total,
      per_100g,
      items: matchedIngredients,
      warnings: warnings.length > 0 ? warnings : null,
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Recalculate error:", error);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
