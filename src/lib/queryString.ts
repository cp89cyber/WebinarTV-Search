export const DEFAULT_LIMIT = 24;
export const DEFAULT_STATUS = "all";
export const DEFAULT_SORT = "recommended";

export type CatalogStatus = "all" | "upcoming" | "past";
export type CatalogSort = "recommended" | "trending" | "start_time" | "score" | "topic";

export interface CatalogFilters {
  q: string;
  category: string;
  status: CatalogStatus;
  sort: CatalogSort;
  page: number;
  limit: number;
}

export const SORT_OPTIONS: Array<{ value: CatalogSort; label: string }> = [
  { value: "recommended", label: "Recommended" },
  { value: "trending", label: "Trending" },
  { value: "start_time", label: "Soonest" },
  { value: "score", label: "Highest score" },
  { value: "topic", label: "A-Z" }
];

export const STATUS_OPTIONS: Array<{ value: CatalogStatus; label: string }> = [
  { value: "all", label: "All timing" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" }
];

const SORT_VALUES = new Set<CatalogSort>(["recommended", "trending", "start_time", "score", "topic"]);
const STATUS_VALUES = new Set<CatalogStatus>(["all", "upcoming", "past"]);

function parsePositiveInt(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function parseCatalogFilters(searchParams: URLSearchParams, limit = DEFAULT_LIMIT): CatalogFilters {
  const rawSort = searchParams.get("sort");
  const rawStatus = searchParams.get("status");

  return {
    q: searchParams.get("q")?.trim() ?? "",
    category: searchParams.get("category")?.trim() ?? "",
    status: rawStatus && STATUS_VALUES.has(rawStatus as CatalogStatus) ? (rawStatus as CatalogStatus) : DEFAULT_STATUS,
    sort: rawSort && SORT_VALUES.has(rawSort as CatalogSort) ? (rawSort as CatalogSort) : DEFAULT_SORT,
    page: parsePositiveInt(searchParams.get("page")) ?? 1,
    limit
  };
}

export function createCatalogSearchParams(filters: CatalogFilters): URLSearchParams {
  const searchParams = new URLSearchParams();
  const normalizedQuery = filters.q.trim();

  if (normalizedQuery) {
    searchParams.set("q", normalizedQuery);
  }

  if (filters.category.trim()) {
    searchParams.set("category", filters.category.trim());
  }

  if (filters.status !== DEFAULT_STATUS) {
    searchParams.set("status", filters.status);
  }

  if (filters.sort !== DEFAULT_SORT) {
    searchParams.set("sort", filters.sort);
  }

  if (filters.page > 1) {
    searchParams.set("page", String(filters.page));
  }

  return searchParams;
}

export function filtersToApiSearchParams(filters: CatalogFilters): URLSearchParams {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(filters.page));
  searchParams.set("limit", String(filters.limit));

  if (filters.q.trim()) {
    searchParams.set("q", filters.q.trim());
  }

  if (filters.category.trim()) {
    searchParams.set("category", filters.category.trim());
  }

  if (filters.status !== DEFAULT_STATUS) {
    searchParams.set("status", filters.status);
  }

  if (filters.sort !== DEFAULT_SORT) {
    searchParams.set("sort", filters.sort);
  }

  return searchParams;
}
