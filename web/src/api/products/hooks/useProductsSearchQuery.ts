import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { getProducts } from "@/api/products/products";

const SEARCH_LIMIT = 20;

export const useProductsSearchQuery = (query: string) =>
  useQuery({
    queryKey: queryKeys.products.search(query, SEARCH_LIMIT).queryKey,
    queryFn: () => getProducts(query, SEARCH_LIMIT),
    enabled: query.length >= 2,
  });
