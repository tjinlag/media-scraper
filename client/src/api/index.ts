import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:3000/api/scrape",
});

// ─── Types ──────────────────────────────────────────────────

export interface Batch {
  id: number;
  status: "pending" | "done";
  total_urls: number;
  done_count: number;
  fail_count: number;
  created_at: string;
}

export interface MediaItem {
  id: number;
  batch_id: number;
  job_id: number;
  media_url: string;
  type: "image" | "video";
  original_url: string;
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

// ─── API calls ──────────────────────────────────────────────

export const api = {
  submitUrls: async (urls: string[]): Promise<ScrapeResponse> => {
    const { data } = await http.post("/", { urls });
    return data;
  },

  getBatches: async (): Promise<Batch[]> => {
    const { data } = await http.get("/media/batches");
    return data;
  },

  getBatch: async (batchId: number): Promise<Batch> => {
    const { data } = await http.get(`/media/batches/${batchId}`);
    return data;
  },

  getMediaItems: async (
    batchId: number,
    params: { type?: string; search?: string; page?: number; limit?: number },
  ): Promise<PaginatedMedia> => {
    const { data } = await http.get(`/media/batches/${batchId}/items`, {
      params,
    });
    return data;
  },
};
