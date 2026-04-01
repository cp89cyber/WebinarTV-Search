import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import { detailFixtures } from "../test/fixtures";
import { renderApp } from "../test/utils";

describe("WebinarDetailPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads a webinar detail page and shows CTA actions", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = input instanceof Request ? input.url : String(input);
      if (url.endsWith("/v1/webinars/tech-1")) {
        return new Response(JSON.stringify(detailFixtures.get("tech-1")), {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        });
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    renderApp(["/webinars/tech-1"]);

    expect(await screen.findByRole("heading", { name: "AI Operations Briefing" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /register now/i })).toHaveAttribute("href", "https://example.com/register/1");
    expect(screen.getByRole("link", { name: /open join link/i })).toHaveAttribute("href", "https://example.com/join/ai-ops");
  });

  it("renders a not-found detail state for unknown webinar ids", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = input instanceof Request ? input.url : String(input);
      if (url.endsWith("/v1/webinars/missing-webinar")) {
        return new Response(
          JSON.stringify({
            code: "WEBINAR_NOT_FOUND",
            message: "Webinar missing-webinar was not found."
          }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    renderApp(["/webinars/missing-webinar"]);

    expect(await screen.findByText(/that webinar is no longer in the catalog/i)).toBeInTheDocument();
  });
});
