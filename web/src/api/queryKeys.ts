import { mergeQueryKeys } from "@lukemorales/query-key-factory";
import { productsKeys } from "./products/products.queryKeys";

export const queryKeys = mergeQueryKeys(productsKeys);
