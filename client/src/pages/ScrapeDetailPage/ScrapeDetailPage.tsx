import { useMemo, useState } from "react";
import { useParams } from "react-router";

import {
  useMediaByScrapeBatchId,
  useScrapeBatchDetail,
} from "@/hooks/scrapeBatch";
import { MEDIA_TYPE, type MediaType } from "@/types";

import { MediaItem } from "./components/MediaItem";
import { MediaTypeSelect } from "./components/MediaTypeSelect";
import { MyPagination } from "@/components/core/MyPagination";

export function ScrapeDetailPage() {
  const { scrapeBatchId } = useParams<{ scrapeBatchId: string }>();
  const [page, setPage] = useState(1);

  const [mediaType, setMediaType] = useState<MediaType>(MEDIA_TYPE.ALL);

  const { data } = useScrapeBatchDetail(scrapeBatchId!);
  const { data: mediaItems } = useMediaByScrapeBatchId(
    scrapeBatchId!,
    mediaType,
    page,
  );

  const maxPage = useMemo(() => {
    if (!mediaItems) return 1;
    return Math.ceil(mediaItems.total / mediaItems.limit);
  }, [mediaItems]);

  return (
    <div className="flex flex-col gap-4">
      <h1>Scrape Detail</h1>

      <h3>Your media here:</h3>

      <div>
        <p>Total URLs: {data?.totalUrls}</p>
        <p>Status: {data?.status}</p>
      </div>

      <div className="flex justify-end">
        <MediaTypeSelect
          value={mediaType}
          onValueChange={(value) => setMediaType(value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {mediaItems?.items?.map((mediaItem) => (
          <MediaItem
            key={mediaItem.id}
            url={mediaItem.media_url}
            type={mediaItem.type}
          />
        ))}
      </div>

      <MyPagination
        currentPage={page}
        maxPage={maxPage}
        onPageChange={(page) => setPage(page)}
      />
    </div>
  );
}

export default ScrapeDetailPage;
