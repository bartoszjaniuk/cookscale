import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { getInitialProducts } from "@/api/products/products";

const INITIAL_LIMIT = 12;

export const useInitialProductsQuery = () =>
  useQuery({
    queryKey: queryKeys.products.initial(INITIAL_LIMIT).queryKey,
    queryFn: () => getInitialProducts(INITIAL_LIMIT),
    staleTime: Infinity,
  });
