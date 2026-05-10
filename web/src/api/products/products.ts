import { createSupabaseBrowserClient } from "@/lib/supabase";

export type CookingFactor = {
  cooking_method_id: string;
  yield_factor: number;
  cooking_methods: { id: string; slug: string };
};

export type ProductWithFactors = {
  id: string;
  name: string;
  calories_kcal: number | null;
  protein_g: number | null;
  fat_g: number | null;
  carbs_g: number | null;
  product_cooking_factors: CookingFactor[];
};

const PRODUCT_SELECT = `
  id,
  name,
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
  query: string,
  limit = 20,
): Promise<ProductWithFactors[]> => {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .ilike("name", `%${query}%`)
    .limit(limit)
    .order("name", { ascending: true });

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
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return mapProducts(data);
};
