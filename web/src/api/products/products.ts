import { createSupabaseBrowserClient } from "@/lib/supabase";

export type CookingFactor = {
  cooking_method_id: string;
  yield_factor: number;
  cooking_methods: { id: string; slug: string };
};

export type ProductWithFactors = {
  id: string;
  is_popular: boolean;
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
  is_popular,
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

export const getAllProducts = async (): Promise<ProductWithFactors[]> => {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("name_en", { ascending: true });

  if (error) throw new Error(error.message);
  return mapProducts(data);
};
