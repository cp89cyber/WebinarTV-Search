import type { MetaResponse, PaginatedResponse, WebinarDetail, WebinarSummary } from "../lib/api/schemas";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createSummary(index: number, overrides: Partial<WebinarSummary>): WebinarSummary {
  const isPast = overrides.status === "past";
  const startsAt = overrides.startsAt ?? new Date(Date.UTC(2026, 3, Math.min(index + 1, 28), 15, 0)).toISOString();
  const endsAt =
    overrides.endsAt ?? new Date(Date.parse(startsAt) + 60 * 60 * 1000).toISOString();

  return {
    id: `webinar-${index}`,
    topic: `Webinar Session ${index}`,
    description: `A detailed catalog entry for webinar ${index}.`,
    category: "Technology",
    categories: ["Technology"],
    sourceBuckets: ["trending", "Technology"],
    status: isPast ? "past" : "upcoming",
    startsAt,
    endsAt,
    timeText: null,
    registrationUrl: `https://example.com/register/${index}`,
    joinUrl: null,
    providerHost: "events.example.com",
    score: 20_000 - index,
    trending: 4.9 - index / 1000,
    easyStars: 4,
    highDemandStars: 5,
    hasRecording: isPast,
    isRegisterRequired: true,
    isPast,
    ...overrides
  };
}

const technologyWebinars = Array.from({ length: 30 }, (_, index) =>
  createSummary(index + 1, {
    id: `tech-${index + 1}`,
    topic: index === 0 ? "AI Operations Briefing" : `Technology Briefing ${index + 1}`,
    description:
      index === 0
        ? "An editorial search result about AI operations, automation, and platform reliability."
        : `A catalog briefing focused on technology topic ${index + 1}.`,
    category: "Technology",
    categories: ["Technology"],
    sourceBuckets: ["trending", "Technology"],
    status: index >= 20 ? "past" : "upcoming",
    startsAt: new Date(Date.UTC(2026, 4, (index % 20) + 1, 16, 0)).toISOString(),
    endsAt: new Date(Date.UTC(2026, 4, (index % 20) + 1, 17, 0)).toISOString(),
    providerHost: "zoom.us",
    joinUrl: index === 0 ? "https://example.com/join/ai-ops" : null,
    hasRecording: index >= 20,
    isPast: index >= 20
  })
);

const businessWebinars = Array.from({ length: 6 }, (_, index) =>
  createSummary(101 + index, {
    id: `business-${index + 1}`,
    topic: `Revenue Forum ${index + 1}`,
    description: `Business-focused webinar ${index + 1} covering planning and revenue operations.`,
    category: "Business",
    categories: ["Business"],
    sourceBuckets: ["trending", "Business"],
    status: index % 2 === 0 ? "upcoming" : "past",
    providerHost: "gotowebinar.com",
    hasRecording: index % 2 === 1,
    isPast: index % 2 === 1
  })
);

const educationWebinars = Array.from({ length: 4 }, (_, index) =>
  createSummary(201 + index, {
    id: `education-${index + 1}`,
    topic: `Learning Lab ${index + 1}`,
    description: `Education webinar ${index + 1} for classroom experimentation.`,
    category: "Education",
    categories: ["Education"],
    sourceBuckets: ["trending", "Education"],
    providerHost: "meet.google.com"
  })
);

export const allWebinars: WebinarSummary[] = [...technologyWebinars, ...businessWebinars, ...educationWebinars];

export const metaFixture: MetaResponse = {
  source: {
    url: "https://storage.googleapis.com/webinartv-200-webinars/webinars-200.json",
    etag: '"fixture-etag"',
    lastModified: "Mon, 07 Apr 2025 19:20:05 GMT"
  },
  cache: {
    state: "fresh",
    lastAttemptAt: "2026-04-01T00:00:00.000Z",
    lastRefreshAt: "2026-04-01T00:00:00.000Z",
    expiresAt: "2026-04-01T01:00:00.000Z",
    ttlMs: 3_600_000,
    staleIfErrorMs: 86_400_000
  },
  data: {
    rawRowCount: 80,
    uniqueWebinarCount: allWebinars.length,
    categoryCounts: {
      Technology: technologyWebinars.length,
      Business: businessWebinars.length,
      Education: educationWebinars.length
    },
    categories: [
      { slug: "business", name: "Business", count: businessWebinars.length },
      { slug: "education", name: "Education", count: educationWebinars.length },
      { slug: "technology", name: "Technology", count: technologyWebinars.length }
    ]
  }
};

export function createDetail(summary: WebinarSummary, overrides: Partial<WebinarDetail> = {}): WebinarDetail {
  return {
    ...summary,
    host: {
      id: `host-${summary.id}`,
      code: summary.id.toUpperCase(),
      name: summary.category === "Business" ? "Meridian Studio" : "WebinarTV Editorial Desk",
      exists: true,
      registerEmail: "events@example.com"
    },
    media: {
      graphic: `https://cdn.example.com/${summary.id}/graphic.jpg`,
      webinarBanner: `https://cdn.example.com/${summary.id}/banner.jpg`,
      customImage: summary.id === "tech-1" ? "https://cdn.example.com/tech-1/custom.jpg" : null,
      recordedUrl: summary.hasRecording ? `https://cdn.example.com/${summary.id}/recording` : null,
      hasGraphic: true,
      hasBanner: true,
      hasCustomImage: summary.id === "tech-1"
    },
    flags: {
      over: summary.isPast,
      overWeb: summary.isPast,
      success: 1,
      record: summary.hasRecording ? 1 : 0,
      searchAdded: true,
      hostExists: true,
      existingHost: true,
      subcategoryExists: true
    },
    sourceMeta: {
      categoryBucket: summary.category,
      sourceBuckets: summary.sourceBuckets,
      variantCount: summary.sourceBuckets.length
    },
    raw: {
      merged: {
        id: summary.id,
        topic: summary.topic
      },
      sourceVariants: {
        trending: {
          id: summary.id
        },
        category: {
          id: summary.id,
          category: summary.category
        }
      }
    },
    ...overrides
  };
}

export const detailFixtures = new Map<string, WebinarDetail>(
  allWebinars.map((webinar) => [webinar.id, createDetail(webinar)])
);

export function createPaginatedResponse(
  items: WebinarSummary[],
  page: number,
  limit: number
): PaginatedResponse<WebinarSummary> {
  return {
    items,
    page,
    limit,
    totalItems: items.length,
    totalPages: items.length === 0 ? 0 : Math.ceil(items.length / limit)
  };
}

function defaultSort(left: WebinarSummary, right: WebinarSummary): number {
  return (
    (right.trending ?? -Infinity) - (left.trending ?? -Infinity) ||
    (right.score ?? -Infinity) - (left.score ?? -Infinity) ||
    Date.parse(left.startsAt ?? "2999-01-01T00:00:00.000Z") -
      Date.parse(right.startsAt ?? "2999-01-01T00:00:00.000Z") ||
    left.topic.localeCompare(right.topic)
  );
}

function sortWebinars(items: WebinarSummary[], sort: string | null): WebinarSummary[] {
  const sorted = [...items];

  switch (sort) {
    case "start_time":
      return sorted.sort(
        (left, right) =>
          Date.parse(left.startsAt ?? "2999-01-01T00:00:00.000Z") -
            Date.parse(right.startsAt ?? "2999-01-01T00:00:00.000Z") || defaultSort(left, right)
      );
    case "score":
      return sorted.sort((left, right) => (right.score ?? -Infinity) - (left.score ?? -Infinity) || defaultSort(left, right));
    case "topic":
      return sorted.sort((left, right) => left.topic.localeCompare(right.topic) || defaultSort(left, right));
    case "trending":
    default:
      return sorted.sort(defaultSort);
  }
}

export function buildWebinarListResponse(searchParams: URLSearchParams): PaginatedResponse<WebinarSummary> {
  const page = Number.parseInt(searchParams.get("page") ?? "1", 10) || 1;
  const limit = Number.parseInt(searchParams.get("limit") ?? "24", 10) || 24;
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const category = searchParams.get("category")?.trim();
  const status = searchParams.get("status")?.trim();
  const sort = searchParams.get("sort");

  const filtered = allWebinars.filter((webinar) => {
    if (category && slugify(webinar.category) !== slugify(category)) {
      return false;
    }

    if (status && status !== "all" && webinar.status !== status) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = [webinar.topic, webinar.description, webinar.category, ...webinar.categories].join(" ").toLowerCase();
    return haystack.includes(query);
  });

  const sorted = sortWebinars(filtered, sort);
  const start = (page - 1) * limit;
  const items = sorted.slice(start, start + limit);

  return {
    items,
    page,
    limit,
    totalItems: filtered.length,
    totalPages: filtered.length === 0 ? 0 : Math.ceil(filtered.length / limit)
  };
}

export const mswRequestLog: string[] = [];

export function resetMswRequestLog() {
  mswRequestLog.splice(0, mswRequestLog.length);
}
