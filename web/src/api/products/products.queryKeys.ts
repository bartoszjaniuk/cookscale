import { createQueryKeys } from "@lukemorales/query-key-factory";

export const productsKeys = createQueryKeys("products", {
  initial: (limit: number) => [{ limit }],
  search: (query: string, limit: number) => [{ query, limit }],
});
