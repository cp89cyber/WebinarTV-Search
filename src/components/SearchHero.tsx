import type { ChangeEvent } from "react";

import { Link } from "react-router-dom";

export type SourceCacheStatus = "loading" | "fresh" | "stale" | "unavailable";

interface SearchHeroProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  totalWebinars?: number;
  totalCategories?: number;
  sourceCacheStatus: SourceCacheStatus;
  resultSummary: string;
  isRefreshing: boolean;
}

const sourceCacheDisplay: Record<SourceCacheStatus, { label: string; description: string }> = {
  loading: {
    label: "Loading",
    description: "Checking the public WebiCast API cache state."
  },
  fresh: {
    label: "Fresh",
    description: "The API metadata is within the upstream cache window."
  },
  stale: {
    label: "Stale",
    description: "The API is serving the latest cached snapshot while refresh recovers."
  },
  unavailable: {
    label: "Unavailable",
    description: "Cache metadata could not be loaded. Search remains available."
  }
};

function formatMetric(value: number | undefined): string {
  return typeof value === "number" ? value.toLocaleString() : "—";
}

export function SearchHero({
  searchValue,
  onSearchChange,
  totalWebinars,
  totalCategories,
  sourceCacheStatus,
  resultSummary,
  isRefreshing
}: SearchHeroProps) {
  const sourceCache = sourceCacheDisplay[sourceCacheStatus];

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onSearchChange(event.target.value);
  }

  return (
    <section className="hero">
      <div className="hero__copy">
        <Link className="hero__brand" to="/">
          WebinarTV Search
        </Link>
        <p className="hero__eyebrow">Editorial webinar discovery</p>
        <h1>Find the next webinar worth your attention.</h1>
        <p className="hero__lede">
          Search the public WebinarTV catalog by topic, category, and schedule. Results stay deep-linkable, API-backed,
          and ready to share.
        </p>
        <label className="hero__search" htmlFor="catalog-search">
          <span className="sr-only">Search webinars</span>
          <span aria-hidden="true" className="hero__search-icon">
            Search
          </span>
          <input
            id="catalog-search"
            name="catalog-search"
            type="search"
            value={searchValue}
            onChange={handleChange}
            placeholder="Search by topic, category, speaker, or keyword"
            autoComplete="off"
          />
        </label>
        <div className="hero__status-row">
          <p>{resultSummary}</p>
          <p>{isRefreshing ? "Refreshing results…" : "Results update after a short pause."}</p>
        </div>
      </div>
      <div className="hero__metrics" aria-label="Catalog overview">
        <article className="hero__metric-card">
          <span>Catalog size</span>
          <strong>{formatMetric(totalWebinars)}</strong>
          <p>Unique webinars published by WebinarTV.</p>
        </article>
        <article className="hero__metric-card">
          <span>Categories</span>
          <strong>{formatMetric(totalCategories)}</strong>
          <p>Editorial sections available to browse.</p>
        </article>
        <article className="hero__metric-card">
          <span>Source cache</span>
          <strong>{sourceCache.label}</strong>
          <p>{sourceCache.description}</p>
        </article>
      </div>
    </section>
  );
}
