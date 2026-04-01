import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { FilterBar } from "../components/FilterBar";
import { Pagination } from "../components/Pagination";
import { SearchHero } from "../components/SearchHero";
import { WebinarCard } from "../components/WebinarCard";
import { useCatalogFilters } from "../hooks/useCatalogFilters";
import { useMeta } from "../hooks/useMeta";
import { useWebinars } from "../hooks/useWebinars";

function getResultSummary(totalItems?: number, query?: string): string {
  if (typeof totalItems !== "number") {
    return "Loading the current catalog snapshot.";
  }

  const formattedCount = totalItems.toLocaleString();
  return query ? `${formattedCount} results for “${query}”.` : `${formattedCount} results in the current feed.`;
}

export function SearchPage() {
  const location = useLocation();
  const { filters, searchDraft, setSearchDraft, setCategory, setStatus, setSort, setPage, clearFilters } =
    useCatalogFilters();
  const metaQuery = useMeta();
  const webinarsQuery = useWebinars(filters);

  useEffect(() => {
    document.title = filters.q ? `${filters.q} | WebinarTV Search` : "WebinarTV Search";
  }, [filters.q]);

  return (
    <main className="page-shell">
      <SearchHero
        searchValue={searchDraft}
        onSearchChange={setSearchDraft}
        totalWebinars={metaQuery.data?.data.uniqueWebinarCount}
        totalCategories={metaQuery.data?.data.categories.length}
        cacheState={metaQuery.data?.cache.state}
        resultSummary={getResultSummary(webinarsQuery.data?.totalItems, filters.q)}
        isRefreshing={webinarsQuery.isFetching}
      />

      <FilterBar
        categories={metaQuery.data?.data.categories ?? []}
        filters={filters}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
        onSortChange={setSort}
        onClearFilters={clearFilters}
        categoryDisabled={metaQuery.isError}
      />

      {metaQuery.isError ? (
        <p className="page-note" role="status">
          Category counts are temporarily unavailable. Search remains active while metadata recovers.
        </p>
      ) : null}

      <section className="results-section" aria-live="polite">
        <div className="results-section__header">
          <div>
            <p className="results-section__eyebrow">Search results</p>
            <h2>Browse the current catalog</h2>
          </div>
          {webinarsQuery.data ? (
            <p className="results-section__summary">
              Page {webinarsQuery.data.page} of {Math.max(webinarsQuery.data.totalPages, 1)}
            </p>
          ) : null}
        </div>

        {webinarsQuery.isPending && !webinarsQuery.data ? (
          <div className="results-grid" aria-busy="true">
            {Array.from({ length: 6 }, (_, index) => (
              <article key={index} className="card card--skeleton">
                <div className="card__poster" />
                <div className="card__body">
                  <div className="skeleton-line skeleton-line--short" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {webinarsQuery.isError ? (
          <ErrorState
            title="We couldn't load the webinar feed"
            message="The search API did not return results for this request. Retry without losing the current URL filters."
            actionLabel="Retry search"
            onAction={() => void webinarsQuery.refetch()}
          />
        ) : null}

        {!webinarsQuery.isError && webinarsQuery.data && webinarsQuery.data.items.length === 0 ? (
          <EmptyState
            title="No webinars matched this search"
            message="Try a broader keyword, switch timing, or clear the active filters to widen the feed."
            actionLabel="Clear filters"
            onAction={clearFilters}
          />
        ) : null}

        {!webinarsQuery.isError && webinarsQuery.data && webinarsQuery.data.items.length > 0 ? (
          <>
            <div className="results-grid">
              {webinarsQuery.data.items.map((webinar) => (
                <WebinarCard key={webinar.id} webinar={webinar} fromSearch={location.search} />
              ))}
            </div>
            <Pagination
              currentPage={webinarsQuery.data.page}
              totalPages={webinarsQuery.data.totalPages}
              onPageChange={setPage}
            />
          </>
        ) : null}
      </section>
    </main>
  );
}
