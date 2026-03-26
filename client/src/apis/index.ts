import type {
  MediaItemsResponse,
  MediaType,
  ScrapeBatchDetailResponse,
} from "@/types";
import axios from "axios";

export async function getMediaByScrapeBatchId(
  scrapeBatchId: string,
  mediaType: MediaType,
  offset: number,
  limit: number,
) {
  const { data } = await axios.get<MediaItemsResponse>(
    `http://localhost:3000/api/scrape/${scrapeBatchId}/media?type=${mediaType}&offset=${offset}&limit=${limit}`,
  );

  return data.data;
}

export async function getScrapeBatchDetail(scrapeBatchId: string) {
  const {
    data: { data },
  } = await axios.get<ScrapeBatchDetailResponse>(
    `http://localhost:3000/api/scrape/${scrapeBatchId}`,
  );

  return {
    id: data.id,
    status: data.status,
    totalUrls: data.total_urls,
  };
}
