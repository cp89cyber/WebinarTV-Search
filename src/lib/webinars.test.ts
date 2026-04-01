import { describe, expect, it } from "vitest";

import { createDetail } from "../test/fixtures";
import { buildWebinarCtas, formatStatusLabel, formatWebinarSchedule, getHeroImage } from "./webinars";

describe("webinar helpers", () => {
  it("prefers registration, then join, then recording CTAs", () => {
    const webinar = createDetail(
      {
        id: "detail-1",
        topic: "AI Ops",
        description: "AI Ops description",
        category: "Technology",
        categories: ["Technology"],
        sourceBuckets: ["trending", "Technology"],
        status: "upcoming",
        startsAt: "2026-04-01T15:00:00.000Z",
        endsAt: "2026-04-01T16:00:00.000Z",
        timeText: null,
        registrationUrl: "https://example.com/register",
        joinUrl: "https://example.com/join",
        providerHost: "zoom.us",
        score: 1,
        trending: 2,
        easyStars: null,
        highDemandStars: null,
        hasRecording: true,
        isRegisterRequired: true,
        isPast: false
      },
      {
        media: {
          graphic: "https://example.com/graphic.jpg",
          webinarBanner: "https://example.com/banner.jpg",
          customImage: "https://example.com/custom.jpg",
          recordedUrl: "https://example.com/watch",
          hasGraphic: true,
          hasBanner: true,
          hasCustomImage: true
        }
      }
    );

    expect(buildWebinarCtas(webinar).map((cta) => cta.kind)).toEqual(["register", "join", "watch"]);
  });

  it("formats schedule text from ISO times", () => {
    expect(
      formatWebinarSchedule({
        startsAt: "2026-04-01T15:00:00.000Z",
        endsAt: "2026-04-01T16:30:00.000Z",
        timeText: null
      })
    ).toContain("Apr");
  });

  it("returns a fallback schedule and status label", () => {
    expect(formatWebinarSchedule({ startsAt: null, endsAt: null, timeText: null })).toBe("Date TBD");
    expect(formatStatusLabel("past")).toBe("Past");
  });

  it("uses hero image precedence custom -> banner -> graphic", () => {
    expect(
      getHeroImage({
        media: {
          graphic: "https://example.com/graphic.jpg",
          webinarBanner: "https://example.com/banner.jpg",
          customImage: "https://example.com/custom.jpg",
          recordedUrl: null,
          hasGraphic: true,
          hasBanner: true,
          hasCustomImage: true
        }
      })
    ).toBe("https://example.com/custom.jpg");
  });
});
