import { createSupabaseBrowserClient } from "@/lib/supabase";
import { z } from "zod";

export type CookingFactor = {
  cooking_method_id: string;
  yield_factor: number;
  cooking_methods: { id: string; slug: string };
};

export type ProductWithFactors = {
  id: string;
  name_en: string;
  name_pl: string;
  calories_kcal: number | null;
  protein_g: number | null;
  fat_g: number | null;
  carbs_g: number | null;
  product_cooking_factors: CookingFactor[];
};

const PRODUCT_SELECT = `
  id,
  name_en,
  name_pl,
  calories_kcal,
  protein_g,
  fat_g,
  carbs_g,
  product_cooking_factors(
    cooking_method_id,
    yield_factor,
    cooking_methods(id, slug)
  )
` as const;

const supabase = createSupabaseBrowserClient();

const mapProducts = (
  data: Record<string, unknown>[] | null,
): ProductWithFactors[] => (data ?? []) as ProductWithFactors[];

export const getProducts = async (
  rawQuery: string,
  limit = 20,
): Promise<ProductWithFactors[]> => {
  // Sanitize the query to prevent PostgREST syntax errors
  // Removes commas, quotes, parentheses and other special characters that might break the .or() filter
  let safeQuery = "";
  try {
    safeQuery = z
      .string()
      .parse(rawQuery)
      .replace(/[(),"]/g, "")
      .trim();
  } catch {
    return [];
  }

  if (!safeQuery) return [];

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .or(`name_en.ilike.%${safeQuery}%,name_pl.ilike.%${safeQuery}%`)
    .limit(limit)
    .order("name_en", { ascending: true });

  if (error) throw new Error(error.message);
  return mapProducts(data);
};

export const getInitialProducts = async (
  limit = 12,
): Promise<ProductWithFactors[]> => {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .limit(limit)
    .order("name_en", { ascending: true });

  if (error) throw new Error(error.message);
  return mapProducts(data);
};
