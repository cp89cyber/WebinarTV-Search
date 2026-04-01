import { useState } from "react";

import type { CategoryCount } from "../lib/api/schemas";
import { SORT_OPTIONS, STATUS_OPTIONS, type CatalogFilters } from "../lib/queryString";

interface FilterBarProps {
  categories: CategoryCount[];
  filters: CatalogFilters;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: CatalogFilters["status"]) => void;
  onSortChange: (value: CatalogFilters["sort"]) => void;
  onClearFilters: () => void;
  categoryDisabled: boolean;
}

export function FilterBar({
  categories,
  filters,
  onCategoryChange,
  onStatusChange,
  onSortChange,
  onClearFilters,
  categoryDisabled
}: FilterBarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const activeFilterCount =
    Number(Boolean(filters.category)) + Number(filters.status !== "all") + Number(filters.sort !== "recommended");

  return (
    <section className="filter-bar">
      <div className="filter-bar__header">
        <div>
          <p className="filter-bar__eyebrow">Catalog controls</p>
          <h2>Refine the feed</h2>
        </div>
        <button
          className="filter-bar__toggle"
          type="button"
          aria-expanded={isMobileOpen}
          aria-controls="catalog-filter-panel"
          onClick={() => setIsMobileOpen((value) => !value)}
        >
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </button>
      </div>
      <div className={`filter-bar__panel ${isMobileOpen ? "is-open" : ""}`} id="catalog-filter-panel">
        <label className="filter-control">
          <span>Category</span>
          <select
            value={filters.category}
            onChange={(event) => {
              onCategoryChange(event.target.value);
              setIsMobileOpen(false);
            }}
            disabled={categoryDisabled}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>
        </label>
        <label className="filter-control">
          <span>Status</span>
          <select
            value={filters.status}
            onChange={(event) => {
              onStatusChange(event.target.value as CatalogFilters["status"]);
              setIsMobileOpen(false);
            }}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="filter-control">
          <span>Sort</span>
          <select
            value={filters.sort}
            onChange={(event) => {
              onSortChange(event.target.value as CatalogFilters["sort"]);
              setIsMobileOpen(false);
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button className="filter-bar__clear" type="button" onClick={onClearFilters}>
          Clear filters
        </button>
      </div>
    </section>
  );
}
