import { z } from "zod";

import {
  apiErrorSchema,
  metaResponseSchema,
  paginatedResponseSchema,
  webinarDetailSchema,
  webinarSummarySchema,
  type MetaResponse,
  type PaginatedResponse,
  type WebinarDetail,
  type WebinarSummary
} from "./schemas";
import { resolveApiEndpoint } from "./config";
import { filtersToApiSearchParams, type CatalogFilters } from "../queryString";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  schema: z.ZodSchema<T>,
  options?: {
    searchParams?: URLSearchParams;
    signal?: AbortSignal;
  }
): Promise<T> {
  const url = resolveApiEndpoint(path);
  if (options?.searchParams) {
    url.search = options.searchParams.toString();
  }

  const response = await fetch(url, {
    method: "GET",
    signal: options?.signal,
    headers: {
      Accept: "application/json"
    }
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload: unknown = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const parsedError = apiErrorSchema.safeParse(payload);
    throw new ApiError(
      response.status,
      parsedError.success ? parsedError.data.message : `Request failed with status ${response.status}`,
      parsedError.success ? parsedError.data.code : undefined,
      parsedError.success ? parsedError.data.details : undefined
    );
  }

  return schema.parse(payload);
}

export function fetchMeta(signal?: AbortSignal): Promise<MetaResponse> {
  return request("/v1/meta", metaResponseSchema, { signal });
}

export function fetchWebinars(
  filters: CatalogFilters,
  signal?: AbortSignal
): Promise<PaginatedResponse<WebinarSummary>> {
  return request("/v1/webinars", paginatedResponseSchema(webinarSummarySchema), {
    searchParams: filtersToApiSearchParams(filters),
    signal
  });
}

export function fetchWebinarDetail(id: string, signal?: AbortSignal): Promise<WebinarDetail> {
  return request(`/v1/webinars/${encodeURIComponent(id)}`, webinarDetailSchema, { signal });
}
