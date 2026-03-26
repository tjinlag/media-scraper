import axios from "axios";

import {
  type GetMediaItemsResponse,
  type GetScrapeBatchResponse,
  type MediaItem,
  type PostScrapeUrlsResponse,
} from "@/types";

const http = axios.create({
  baseURL: "http://localhost:3000/api/scrape",
});

export interface Batch {
  id: number;
  status: "pending" | "done";
  total_urls: number;
  done_count: number;
  fail_count: number;
  created_at: string;
}

export interface PaginatedMedia {
  items: MediaItem[];
  total: number;
  page: number;
  pages: number;
}

export interface ScrapeResponse {
  message: string;
  batchId: number;
  totalUrls: number;
}

export const api = {
  scrapeUrls: async (urls: string[]) => {
    const { data } = await http.post<PostScrapeUrlsResponse>("/", { urls });
    return data.data;
  },

  getBatches: async (): Promise<Batch[]> => {
    const { data } = await http.get("/media/batches");
    return data;
  },

  getScrapeBatch: async (scrapeBatchId: string) => {
    const { data } = await http.get<GetScrapeBatchResponse>(
      `/${scrapeBatchId}`,
    );
    return data.data;
  },

  getMediaItems: async (
    scrapeBatchId: string,
    params: { type?: string; offset?: number; limit?: number },
  ) => {
    const { data } = await http.get<GetMediaItemsResponse>(
      `/${scrapeBatchId}/media`,
      {
        params,
      },
    );

    return data.data;
  },
};
