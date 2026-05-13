import { useMemo } from "react";
import { type ProductWithFactors } from "@/api/products/products";
import { useAllProductsQuery } from "./useAllProductsQuery";

export const useProductSearch = (query: string) => {
  const { data: allProducts = [], isLoading } = useAllProductsQuery();

  const products = useMemo(() => {
    if (query.length < 2) {
      return allProducts.filter((p) => p.is_popular);
    }

    const lowerQuery = query.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name_en.toLowerCase().includes(lowerQuery) ||
        p.name_pl.toLowerCase().includes(lowerQuery),
    );
  }, [allProducts, query]);

  return { products, isLoading };
};
