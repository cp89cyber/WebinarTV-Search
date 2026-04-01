import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  createCatalogSearchParams,
  parseCatalogFilters,
  DEFAULT_SORT,
  DEFAULT_STATUS,
  type CatalogFilters
} from "../lib/queryString";

export function useCatalogFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseCatalogFilters(searchParams);
  const [searchDraft, setSearchDraft] = useState(filters.q);
  const deferredSearchDraft = useDeferredValue(searchDraft);

  useEffect(() => {
    setSearchDraft(filters.q);
  }, [filters.q]);

  useEffect(() => {
    const nextQuery = deferredSearchDraft.trim();
    if (nextQuery === filters.q) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      startTransition(() => {
        setSearchParams(
          createCatalogSearchParams({
            ...filters,
            q: nextQuery,
            page: 1
          }),
          { replace: true }
        );
      });
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [deferredSearchDraft, filters, setSearchParams]);

  function updateFilters(updates: Partial<CatalogFilters>, replace = false) {
    startTransition(() => {
      setSearchParams(createCatalogSearchParams({ ...filters, ...updates }), { replace });
    });
  }

  return {
    filters,
    searchDraft,
    setSearchDraft,
    setCategory(category: string) {
      updateFilters({ category, page: 1 });
    },
    setStatus(status: CatalogFilters["status"]) {
      updateFilters({ status, page: 1 });
    },
    setSort(sort: CatalogFilters["sort"]) {
      updateFilters({ sort, page: 1 });
    },
    setPage(page: number) {
      updateFilters({ page });
    },
    clearFilters() {
      updateFilters({ category: "", status: DEFAULT_STATUS, sort: DEFAULT_SORT, page: 1 });
    }
  };
}
