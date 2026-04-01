import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchWebinars } from "../lib/api/client";
import type { CatalogFilters } from "../lib/queryString";

export function useWebinars(filters: CatalogFilters) {
  return useQuery({
    queryKey: ["webinars", filters],
    queryFn: ({ signal }) => fetchWebinars(filters, signal),
    placeholderData: keepPreviousData
  });
}
