import { describe, expect, it } from "vitest";

import { createCatalogSearchParams, filtersToApiSearchParams, parseCatalogFilters } from "./queryString";

describe("queryString helpers", () => {
  it("parses supported URL params with defaults", () => {
    const filters = parseCatalogFilters(
      new URLSearchParams("q=ai+ops&category=technology&status=upcoming&sort=score&page=3")
    );

    expect(filters).toEqual({
      q: "ai ops",
      category: "technology",
      status: "upcoming",
      sort: "score",
      page: 3,
      limit: 24
    });
  });

  it("omits default values from shareable search params", () => {
    const params = createCatalogSearchParams({
      q: "AI ops",
      category: "",
      status: "all",
      sort: "recommended",
      page: 1,
      limit: 24
    });

    expect(params.toString()).toBe("q=AI+ops");
  });

  it("serializes API params with pagination and non-default filters", () => {
    const params = filtersToApiSearchParams({
      q: "AI ops",
      category: "technology",
      status: "upcoming",
      sort: "score",
      page: 2,
      limit: 24
    });

    expect(params.toString()).toBe("page=2&limit=24&q=AI+ops&category=technology&status=upcoming&sort=score");
  });
});
