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

export interface ScrapeJob {
  id: number;
  batchId: number;
  url: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: number;
  jobId: number;
  batchId: number;
  media_url: string;
  type: "image" | "video";
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
