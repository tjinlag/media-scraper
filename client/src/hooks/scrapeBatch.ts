import { useEffect, useState } from "react";
import axios from "axios";

import type {
  MediaItemsResponse,
  MediaItemsResponseData,
  ScrapeBatch,
} from "@/types";

export function useScrapeBatchDetail(scrapeBatchId: string) {
  const [data, setData] = useState<ScrapeBatch | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchScrapeBatchDetail() {
      try {
        setLoading(true);

        const response = await fetch(
          `http://localhost:3000/api/scrape/${scrapeBatchId}`,
        );
        const data = await response.json();

        setData(data.data);
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

export function useMediaByScrapeBatchId(scrapeBatchId: string) {
  const [data, setData] = useState<MediaItemsResponseData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const { data } = await axios.get<MediaItemsResponse>(
          `http://localhost:3000/api/scrape/${scrapeBatchId}/media`,
        );

        setData(data.data);
      } catch (err) {
        console.log("[ERROR] Failed to fetch scrape jobs", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [scrapeBatchId]);

  return { data, loading };
}
