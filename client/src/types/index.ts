import type { SCRAPE_BATCH_STATUS } from "@/constants";

export type SnakeToCamel<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Head}${Capitalize<SnakeToCamel<Tail>>}`
    : S;

export type KeysToCamelCase<T> = T extends (infer U)[]
  ? KeysToCamelCase<U>[]
  : T extends object
    ? {
        [K in keyof T as SnakeToCamel<K & string>]: KeysToCamelCase<T[K]>;
      }
    : T;

export interface IResponse<T> {
  message: string | null;
  data: T;
  error: string | null;
}

export interface ScrapeBatch {
  scrapeBatchId: number;
  totalUrls: number;
  urls: string[];
}

export type ScrapeBatchResponse = IResponse<ScrapeBatch>;

export interface ScrapeBatchDetailRaw {
  id: number;
  status: "completed" | "pending" | "failed";
  total_urls: number;
  done_count: number;
  fail_count: number;
  created_at: string;
}

export interface ScrapeBatchDetail {
  id: number;
  status: "completed" | "pending" | "failed";
  totalUrls: number;
}

export type ScrapeBatchDetailResponse = IResponse<ScrapeBatchDetailRaw>;

export interface ScrapeJob {
  id: number;
  batchId: number;
  url: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItemsResponseData {
  items: MediaItem[];
  total: number;
  offset: number;
  limit: number;
}

export type MediaItemsResponse = IResponse<MediaItemsResponseData>;

export const MEDIA_TYPE = {
  ALL: "all",
  IMAGE: "image",
  VIDEO: "video",
} as const;

export type MediaType = (typeof MEDIA_TYPE)[keyof typeof MEDIA_TYPE];

export interface ApiResponse<T> {
  data: T;
  error: string | null;
  message: string | null;
}

interface MediaItemRaw {
  batch_id: number;
  created_at: string;
  id: number;
  job_id: number;
  media_url: string;
  type: Exclude<MediaType, "all">;
}

export type MediaItem = KeysToCamelCase<MediaItemRaw>;

export interface GetMediaItemsRaw {
  items: MediaItemRaw[];
  total: number;
  offset: number;
  limit: number;
}

export type GetMediaItemsResponse = IResponse<GetMediaItemsRaw>;

export type GetMediaItems = KeysToCamelCase<GetMediaItemsRaw>;

export interface PostScrapeUrls {
  scrapeBatchId: number;
  totalUrls: number;
  urls: string[];
}

export type PostScrapeUrlsResponse = IResponse<PostScrapeUrls>;

export type ScrapeBatchStatus =
  (typeof SCRAPE_BATCH_STATUS)[keyof typeof SCRAPE_BATCH_STATUS];

export interface GetScrapeBatchRaw {
  id: number;
  status: ScrapeBatchStatus;
  total_urls: number;
  done_count: number;
  fail_count: number;
  created_at: string;
}

export type GetScrapeBatch = KeysToCamelCase<GetScrapeBatchRaw>;

export type GetScrapeBatchResponse = IResponse<GetScrapeBatchRaw>;
