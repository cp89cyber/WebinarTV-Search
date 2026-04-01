import type { WebinarDetail, WebinarSummary } from "./api/schemas";

export interface WebinarCta {
  href: string;
  label: string;
  kind: "register" | "join" | "watch";
}

function isValidExternalUrl(value: string | null): value is string {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(value);
}

function formatTime(value: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(value);
}

export function formatWebinarSchedule(webinar: Pick<WebinarSummary, "startsAt" | "endsAt" | "timeText">): string {
  const start = webinar.startsAt ? new Date(webinar.startsAt) : null;
  const end = webinar.endsAt ? new Date(webinar.endsAt) : null;
  const hasStart = Boolean(start && !Number.isNaN(start.getTime()));
  const hasEnd = Boolean(end && !Number.isNaN(end.getTime()));

  if (hasStart && start) {
    if (hasEnd && end) {
      if (isSameDay(start, end)) {
        return `${formatDate(start)} · ${formatTime(start)} - ${formatTime(end)}`;
      }

      return `${formatDate(start)} ${formatTime(start)} - ${formatDate(end)} ${formatTime(end)}`;
    }

    return `${formatDate(start)} · ${formatTime(start)}`;
  }

  const normalizedTimeText = webinar.timeText?.replace(/\s+/g, " ").trim();
  return normalizedTimeText || "Date TBD";
}

export function formatStatusLabel(status: WebinarSummary["status"]): string {
  return status === "past" ? "Past" : "Upcoming";
}

export function formatProviderHost(providerHost: string | null): string {
  if (!providerHost) {
    return "Provider unknown";
  }

  return providerHost.replace(/^www\./i, "");
}

export function getHeroImage(webinar: Pick<WebinarDetail, "media">): string | null {
  return webinar.media.customImage ?? webinar.media.webinarBanner ?? webinar.media.graphic ?? null;
}

export function buildWebinarCtas(webinar: Pick<WebinarDetail, "registrationUrl" | "joinUrl" | "media">): WebinarCta[] {
  const candidates: WebinarCta[] = [];

  if (isValidExternalUrl(webinar.registrationUrl)) {
    candidates.push({ href: webinar.registrationUrl, label: "Register now", kind: "register" });
  }

  if (isValidExternalUrl(webinar.joinUrl)) {
    candidates.push({ href: webinar.joinUrl, label: "Open join link", kind: "join" });
  }

  if (isValidExternalUrl(webinar.media.recordedUrl)) {
    candidates.push({ href: webinar.media.recordedUrl, label: "Watch recording", kind: "watch" });
  }

  const uniqueUrls = new Set<string>();

  return candidates.filter((candidate) => {
    if (uniqueUrls.has(candidate.href)) {
      return false;
    }

    uniqueUrls.add(candidate.href);
    return true;
  });
}

export function createDescriptionExcerpt(description: string, maxLength = 180): string {
  const normalized = description.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "No description was provided for this webinar.";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export function getWebinarSignal(webinar: Pick<WebinarSummary, "hasRecording" | "registrationUrl" | "joinUrl" | "isRegisterRequired">): string {
  if (webinar.hasRecording) {
    return "Recording available";
  }

  if (webinar.registrationUrl) {
    return "Registration open";
  }

  if (webinar.joinUrl) {
    return "Join link ready";
  }

  if (webinar.isRegisterRequired) {
    return "Sign-up required";
  }

  return "Details available";
}

export function getPosterHue(seed: string): number {
  let hash = 0;

  for (const character of seed) {
    hash = (hash << 5) - hash + character.charCodeAt(0);
    hash |= 0;
  }

  return Math.abs(hash) % 360;
}
