import { useEffect, useState } from "react";
import axios from "axios";

import type {
  MediaItemsResponse,
  MediaItemsResponseData,
  MediaType,
  ScrapeBatchDetail,
} from "@/types";
import { getScrapeBatchDetail } from "@/apis";
import { DEFAULT_LIMIT } from "@/constants";

export function useScrapeBatchDetail(scrapeBatchId: string) {
  const [data, setData] = useState<ScrapeBatchDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchScrapeBatchDetail() {
      try {
        setLoading(true);

        const res = await getScrapeBatchDetail(scrapeBatchId);
        setData(res);
      } catch (err) {
        console.log("[ERROR] Failed to fetch scrape batch detail", err);
      } finally {
        setLoading(false);
      }
    }

    fetchScrapeBatchDetail();
  }, [scrapeBatchId]);

  return { data, loading };
}

export function useMediaByScrapeBatchId(
  scrapeBatchId: string,
  mediaType: MediaType,
  page: number,
) {
  const [data, setData] = useState<MediaItemsResponseData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const limit = DEFAULT_LIMIT;
        const offset = (page - 1) * limit;

        const { data } = await axios.get<MediaItemsResponse>(
          `http://localhost:3000/api/scrape/${scrapeBatchId}/media?type=${mediaType}&offset=${offset}&limit=${limit}`,
        );

        setData(data.data);
      } catch (err) {
        console.log("[ERROR] Failed to fetch scrape jobs", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [scrapeBatchId, mediaType, page]);

  return { data, loading };
}
