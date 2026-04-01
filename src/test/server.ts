import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";

import { buildWebinarListResponse, detailFixtures, metaFixture, mswRequestLog } from "./fixtures";

export const server = setupServer(
  http.get("*/v1/meta", () => {
    return HttpResponse.json(metaFixture);
  }),
  http.get(/\/v1\/webinars\/[^/?]+$/, ({ request }) => {
    const url = new URL(request.url);
    const id = decodeURIComponent(url.pathname.split("/").pop() ?? "");
    const webinar = detailFixtures.get(id);
    if (!webinar) {
      return HttpResponse.json(
        {
          code: "WEBINAR_NOT_FOUND",
          message: `Webinar ${id} was not found.`
        },
        { status: 404 }
      );
    }

    return HttpResponse.json(webinar);
  }),
  http.get(/\/v1\/webinars(?:\?.*)?$/, ({ request }) => {
    const url = new URL(request.url);
    mswRequestLog.push(url.search);
    return HttpResponse.json(buildWebinarListResponse(url.searchParams));
  })
);
