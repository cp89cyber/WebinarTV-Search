import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { buildWebinarListResponse, metaFixture } from "../test/fixtures";
import { renderApp } from "../test/utils";

function createJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

function installSearchApiMock(options?: {
  metaStatus?: number;
  metaResolver?: () => Response | Promise<Response>;
  listResolver?: (url: URL) => Response | Promise<Response>;
}) {
  const requests: string[] = [];

  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const rawUrl = input instanceof Request ? input.url : String(input);
    const url = new URL(rawUrl);
    requests.push(`${url.pathname}${url.search}`);

    if (url.pathname === "/v1/meta") {
      if (options?.metaResolver) {
        return options.metaResolver();
      }

      if (options?.metaStatus && options.metaStatus !== 200) {
        return createJsonResponse(
          { code: "SOURCE_UNAVAILABLE", message: "Metadata unavailable." },
          options.metaStatus
        );
      }

      return createJsonResponse(metaFixture);
    }

    if (url.pathname === "/v1/webinars") {
      if (options?.listResolver) {
        return options.listResolver(url);
      }

      return createJsonResponse(buildWebinarListResponse(url.searchParams));
    }

    throw new Error(`Unhandled request: ${url.toString()}`);
  });

  return requests;
}

describe("SearchPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("loads the default catalog state", async () => {
    installSearchApiMock();
    renderApp(["/"]);

    expect(await screen.findByText("AI Operations Briefing")).toBeInTheDocument();
    expect(screen.getByText(/40 results in the current feed/i)).toBeInTheDocument();
    expect(screen.getByText("Fresh")).toBeInTheDocument();
    expect(screen.getByText("The API metadata is within the upstream cache window.")).toBeInTheDocument();
    expect(screen.queryByText("Unknown")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /browse the current catalog/i })).toBeInTheDocument();
  });

  it("shows a loading source cache state while metadata is pending", async () => {
    let resolveMeta!: (response: Response) => void;
    const pendingMetaResponse = new Promise<Response>((resolve) => {
      resolveMeta = resolve;
    });

    installSearchApiMock({
      metaResolver: () => pendingMetaResponse
    });

    renderApp(["/"]);

    expect(await screen.findByText("AI Operations Briefing")).toBeInTheDocument();
    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(screen.getByText("Checking the public WebiCast API cache state.")).toBeInTheDocument();
    expect(screen.queryByText("Unknown")).not.toBeInTheDocument();

    resolveMeta(createJsonResponse(metaFixture));

    expect(await screen.findByText("Fresh")).toBeInTheDocument();
  });

  it("debounces search queries before requesting new results", async () => {
    const requests = installSearchApiMock();
    const user = userEvent.setup();
    renderApp(["/"], user);

    await screen.findByText("AI Operations Briefing");
    const input = screen.getByLabelText(/search webinars/i);
    await user.clear(input);
    await user.type(input, "revenue");

    expect(requests.at(-1)).not.toContain("q=revenue");

    await waitFor(() => {
      expect(requests.at(-1)).toContain("q=revenue");
    }, { timeout: 1200 });

    expect(await screen.findByText("Revenue Forum 1")).toBeInTheDocument();
  });

  it("resets pagination to page one when a filter changes", async () => {
    const requests = installSearchApiMock();
    renderApp(["/?page=2"]);

    await screen.findByText(/page 2 of/i);
    await userEvent.selectOptions(screen.getByLabelText(/category/i), "technology");

    await waitFor(() => {
      expect(requests.at(-1)).toContain("/v1/webinars?page=1");
      expect(requests.at(-1)).toContain("category=technology");
    });
  });

  it("renders an empty state when the API returns no items", async () => {
    installSearchApiMock({
      listResolver: () =>
        createJsonResponse({
          items: [],
          page: 1,
          limit: 24,
          totalItems: 0,
          totalPages: 0
        })
    });

    renderApp(["/?q=nonexistent"]);

    expect(await screen.findByText(/no webinars matched this search/i)).toBeInTheDocument();
  });

  it("renders a retryable error state for server failures", async () => {
    let shouldFail = true;

    installSearchApiMock({
      listResolver: (url) => {
        if (shouldFail) {
          return createJsonResponse(
            { code: "SOURCE_UNAVAILABLE", message: "The source is temporarily unavailable." },
            503
          );
        }

        return createJsonResponse(buildWebinarListResponse(url.searchParams));
      }
    });

    renderApp(["/"]);

    expect(await screen.findByText(/we couldn't load the webinar feed/i)).toBeInTheDocument();

    shouldFail = false;
    await userEvent.click(screen.getByRole("button", { name: /retry search/i }));

    expect(await screen.findByText("AI Operations Briefing")).toBeInTheDocument();
    expect(screen.queryByText(/we couldn't load the webinar feed/i)).not.toBeInTheDocument();
  });

  it("retries failed searches without losing active URL filters", async () => {
    let shouldFail = true;
    const requests = installSearchApiMock({
      listResolver: (url) => {
        if (shouldFail) {
          return createJsonResponse(
            { code: "SOURCE_UNAVAILABLE", message: "The source is temporarily unavailable." },
            503
          );
        }

        return createJsonResponse(buildWebinarListResponse(url.searchParams));
      }
    });

    renderApp(["/?q=briefing&category=technology&sort=score&page=2"]);

    expect(await screen.findByText(/we couldn't load the webinar feed/i)).toBeInTheDocument();

    shouldFail = false;
    await userEvent.click(screen.getByRole("button", { name: /retry search/i }));

    await waitFor(() => {
      const webinarRequests = requests.filter((request) => request.startsWith("/v1/webinars"));
      expect(webinarRequests.at(-1)).toBe("/v1/webinars?page=2&limit=24&q=briefing&category=technology&sort=score");
    });

    expect(await screen.findByText("Technology Briefing 25")).toBeInTheDocument();
    expect(screen.getByLabelText(/search webinars/i)).toHaveValue("briefing");
    expect(screen.getByLabelText(/category/i)).toHaveValue("technology");
    expect(screen.getByLabelText(/sort/i)).toHaveValue("score");
    expect(screen.getByText(/page 2 of 2/i)).toBeInTheDocument();
  });

  it("disables category filtering when metadata fails", async () => {
    installSearchApiMock({ metaStatus: 503 });
    renderApp(["/"]);

    expect(await screen.findByText("AI Operations Briefing")).toBeInTheDocument();
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(screen.getByText("Cache metadata could not be loaded. Search remains available.")).toBeInTheDocument();
    expect(screen.getByText(/category counts are temporarily unavailable/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeDisabled();
    expect(screen.queryByText("Unknown")).not.toBeInTheDocument();
  });
});
