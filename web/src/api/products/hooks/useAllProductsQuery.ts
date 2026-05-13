import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { getAllProducts } from "@/api/products/products";

export const useAllProductsQuery = () =>
  useQuery({
    queryKey: queryKeys.products.all.queryKey,
    queryFn: getAllProducts,
    staleTime: Infinity,
  });
