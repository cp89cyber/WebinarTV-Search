type ApiConfigCode = "CONFIG_INVALID_API_BASE_URL" | "CONFIG_MISSING_API_BASE_URL";

const DEFAULT_DEV_API_BASE_URL = "http://localhost:3000";

type RuntimeEnv = Pick<ImportMetaEnv, "DEV" | "VITE_API_BASE_URL">;

export class ConfigurationError extends Error {
  constructor(
    public code: ApiConfigCode,
    message: string
  ) {
    super(message);
    this.name = "ConfigurationError";
  }
}

function createInvalidBaseUrlError(value?: string): ConfigurationError {
  return new ConfigurationError(
    "CONFIG_INVALID_API_BASE_URL",
    `VITE_API_BASE_URL must be an absolute http(s) URL. Received: ${value ?? "(empty)"}`
  );
}

function normalizeApiBaseUrl(url: URL): URL {
  const normalizedUrl = new URL(url.toString());

  if (!normalizedUrl.pathname.endsWith("/")) {
    normalizedUrl.pathname = `${normalizedUrl.pathname}/`;
  }

  return normalizedUrl;
}

export function resolveApiBaseUrl(env: RuntimeEnv = import.meta.env): URL {
  const rawValue = env.VITE_API_BASE_URL?.trim();

  if (!rawValue) {
    if (env.DEV) {
      return normalizeApiBaseUrl(new URL(DEFAULT_DEV_API_BASE_URL));
    }

    throw new ConfigurationError(
      "CONFIG_MISSING_API_BASE_URL",
      "VITE_API_BASE_URL is required in production."
    );
  }

  try {
    const url = new URL(rawValue);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw createInvalidBaseUrlError(rawValue);
    }

    return normalizeApiBaseUrl(url);
  } catch (error) {
    if (error instanceof ConfigurationError) {
      throw error;
    }

    throw createInvalidBaseUrlError(rawValue);
  }
}

export function resolveApiEndpoint(path: string, env: RuntimeEnv = import.meta.env): URL {
  const normalizedPath = path.replace(/^\/+/, "");
  return new URL(normalizedPath, resolveApiBaseUrl(env));
}
