import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api";
import { snakeToCamel } from "@/utils";
import type { GetMediaItems } from "@/types";

export const keys = {
  scrapeBatches: ["scrapeBatches"] as const,
  scrapeBatch: (id: string) => ["scrapeBatches", id] as const,
  mediaItems: (scrapeBatchId: string, filters: object) =>
    ["scrapeBatches", scrapeBatchId, "items", filters] as const,
};

export function useScrapeBatches() {
  return useQuery({
    queryKey: keys.scrapeBatches,
    queryFn: api.getBatches,
  });
}

export function useScrapeBatch(scrapeBatchId: string) {
  return useQuery({
    queryKey: keys.scrapeBatch(scrapeBatchId),
    queryFn: () => api.getScrapeBatch(scrapeBatchId),
    refetchInterval: (query) =>
      query.state.data?.status === "pending" ? 2_000 : false,
    enabled: !!scrapeBatchId,
    select: snakeToCamel,
  });
}

export function useMediaItems(
  scrapeBatchId: string,
  filters: {
    type?: string;
    offset?: number;
    limit?: number;
  },
) {
  const { data: scrapeBatch } = useScrapeBatch(scrapeBatchId);

  return useQuery({
    queryKey: keys.mediaItems(scrapeBatchId, filters),
    queryFn: () => api.getMediaItems(scrapeBatchId, filters),
    enabled: !!scrapeBatchId,
    placeholderData: (prev) => prev,
    select: (data): GetMediaItems => snakeToCamel(data),
    refetchInterval: scrapeBatch?.status === "pending" ? 2_000 : false,
  });
}

export function useScrapeUrls() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.scrapeUrls,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.scrapeBatches });
    },
  });
}
