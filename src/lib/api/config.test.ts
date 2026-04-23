import { describe, expect, it } from "vitest";

import { ConfigurationError, resolveApiBaseUrl, resolveApiEndpoint } from "./config";

describe("resolveApiBaseUrl", () => {
  it("returns the local API origin in development when the env var is unset", () => {
    const apiBaseUrl = resolveApiBaseUrl({
      DEV: true,
      VITE_API_BASE_URL: undefined
    });

    expect(apiBaseUrl.toString()).toBe("http://localhost:3000/");
  });

  it("accepts a valid absolute https URL", () => {
    const apiBaseUrl = resolveApiBaseUrl({
      DEV: false,
      VITE_API_BASE_URL: "https://api.example.com"
    });

    expect(apiBaseUrl.toString()).toBe("https://api.example.com/");
  });

  it("normalizes a base URL with a path segment into a directory URL", () => {
    const apiBaseUrl = resolveApiBaseUrl({
      DEV: false,
      VITE_API_BASE_URL: "https://api.example.com/mock-api"
    });

    expect(apiBaseUrl.toString()).toBe("https://api.example.com/mock-api/");
  });

  it("throws a configuration error when production is missing the env var", () => {
    expect(() =>
      resolveApiBaseUrl({
        DEV: false,
        VITE_API_BASE_URL: undefined
      })
    ).toThrowError(
      expect.objectContaining<Partial<ConfigurationError>>({
        code: "CONFIG_MISSING_API_BASE_URL",
        name: "ConfigurationError"
      })
    );
  });

  it("throws a configuration error when the env var is malformed", () => {
    expect(() =>
      resolveApiBaseUrl({
        DEV: false,
        VITE_API_BASE_URL: "not a url"
      })
    ).toThrowError(
      expect.objectContaining<Partial<ConfigurationError>>({
        code: "CONFIG_INVALID_API_BASE_URL",
        name: "ConfigurationError"
      })
    );
  });

  it("throws a configuration error when the env var is relative", () => {
    expect(() =>
      resolveApiBaseUrl({
        DEV: false,
        VITE_API_BASE_URL: "/v1"
      })
    ).toThrowError(
      expect.objectContaining<Partial<ConfigurationError>>({
        code: "CONFIG_INVALID_API_BASE_URL",
        name: "ConfigurationError"
      })
    );
  });
});

describe("resolveApiEndpoint", () => {
  const env = {
    DEV: false,
    VITE_API_BASE_URL: "https://api.example.com/mock-api"
  } as const;

  it("resolves endpoints with a leading slash against the configured base path", () => {
    const url = resolveApiEndpoint("/v1/meta", env);

    expect(url.toString()).toBe("https://api.example.com/mock-api/v1/meta");
  });

  it("resolves endpoints without a leading slash against the configured base path", () => {
    const url = resolveApiEndpoint("v1/webinars", env);

    expect(url.toString()).toBe("https://api.example.com/mock-api/v1/webinars");
  });
});
