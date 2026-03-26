import { useParams } from "react-router";

import {
  useMediaByScrapeBatchId,
  useScrapeBatchDetail,
} from "@/hooks/scrapeBatch";

import { MediaItem } from "./components/MediaItem";

export function ScrapeDetailPage() {
  const { scrapeBatchId } = useParams<{ scrapeBatchId: string }>();

  const { data } = useScrapeBatchDetail(scrapeBatchId!);
  const { data: mediaItems } = useMediaByScrapeBatchId(scrapeBatchId!);

  return (
    <div>
      <h1>Scrape Detail</h1>

      <div className="flex flex-wrap gap-2">
        {mediaItems?.items?.map((mediaItem) => (
          <MediaItem
            key={mediaItem.id}
            url={mediaItem.media_url}
            type={mediaItem.type}
          />
        ))}
      </div>

      <p>{JSON.stringify(data, null, 2)}</p>
      <p>{JSON.stringify(mediaItems, null, 2)}</p>
    </div>
  );
}

export default ScrapeDetailPage;
