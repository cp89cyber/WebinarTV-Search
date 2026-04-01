import { z } from "zod";

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.string().optional()
});

export const categoryCountSchema = z.object({
  slug: z.string(),
  name: z.string(),
  count: z.number().int().min(0)
});

export const webinarSummarySchema = z.object({
  id: z.string(),
  topic: z.string(),
  description: z.string(),
  category: z.string(),
  categories: z.array(z.string()),
  sourceBuckets: z.array(z.string()),
  status: z.enum(["upcoming", "past"]),
  startsAt: z.string().datetime().nullable(),
  endsAt: z.string().datetime().nullable(),
  timeText: z.string().nullable(),
  registrationUrl: z.string().nullable(),
  joinUrl: z.string().nullable(),
  providerHost: z.string().nullable(),
  score: z.number().nullable(),
  trending: z.number().nullable(),
  easyStars: z.number().nullable(),
  highDemandStars: z.number().nullable(),
  hasRecording: z.boolean(),
  isRegisterRequired: z.boolean(),
  isPast: z.boolean()
});

const webinarHostSchema = z.object({
  id: z.string().nullable(),
  code: z.string().nullable(),
  name: z.string().nullable(),
  exists: z.boolean().nullable(),
  registerEmail: z.string().nullable()
});

const webinarMediaSchema = z.object({
  graphic: z.string().nullable(),
  webinarBanner: z.string().nullable(),
  customImage: z.string().nullable(),
  recordedUrl: z.string().nullable(),
  hasGraphic: z.boolean(),
  hasBanner: z.boolean(),
  hasCustomImage: z.boolean()
});

const webinarFlagsSchema = z.object({
  over: z.boolean(),
  overWeb: z.boolean().nullable(),
  success: z.number().nullable(),
  record: z.number().nullable(),
  searchAdded: z.boolean().nullable(),
  hostExists: z.boolean().nullable(),
  existingHost: z.boolean().nullable(),
  subcategoryExists: z.boolean().nullable()
});

const webinarSourceMetaSchema = z.object({
  categoryBucket: z.string().nullable(),
  sourceBuckets: z.array(z.string()),
  variantCount: z.number().int().min(0)
});

const webinarRawDataSchema = z.object({
  merged: z.record(z.unknown()),
  sourceVariants: z.object({
    trending: z.record(z.unknown()).nullable(),
    category: z.record(z.unknown()).nullable()
  })
});

export const webinarDetailSchema = webinarSummarySchema.extend({
  host: webinarHostSchema,
  media: webinarMediaSchema,
  flags: webinarFlagsSchema,
  sourceMeta: webinarSourceMetaSchema,
  raw: webinarRawDataSchema
});

export function paginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    totalItems: z.number().int().min(0),
    totalPages: z.number().int().min(0)
  });
}

export const metaResponseSchema = z.object({
  source: z.object({
    url: z.string().url(),
    etag: z.string().nullable(),
    lastModified: z.string().nullable()
  }),
  cache: z.object({
    state: z.enum(["fresh", "stale"]),
    lastAttemptAt: z.string().nullable(),
    lastRefreshAt: z.string().nullable(),
    expiresAt: z.string().nullable(),
    ttlMs: z.number().int().min(1),
    staleIfErrorMs: z.number().int().min(1)
  }),
  data: z.object({
    rawRowCount: z.number().int().min(0),
    uniqueWebinarCount: z.number().int().min(0),
    categoryCounts: z.record(z.number().int().min(0)),
    categories: z.array(categoryCountSchema)
  })
});

export type ApiErrorResponse = z.infer<typeof apiErrorSchema>;
export type CategoryCount = z.infer<typeof categoryCountSchema>;
export type WebinarSummary = z.infer<typeof webinarSummarySchema>;
export type WebinarDetail = z.infer<typeof webinarDetailSchema>;
export type MetaResponse = z.infer<typeof metaResponseSchema>;
export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};
