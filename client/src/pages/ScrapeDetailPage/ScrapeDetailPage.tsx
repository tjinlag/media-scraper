import { useMemo, useState } from "react";
import { useParams } from "react-router";

import { MyPagination } from "@/components/core/MyPagination";
import { DEFAULT_LIMIT } from "@/constants";
import { useMediaItems, useScrapeBatch } from "@/hooks/useMedia";
import { MEDIA_TYPE, type MediaType } from "@/types";

import { MediaItem } from "./components/MediaItem";
import { MediaTypeSelect } from "./components/MediaTypeSelect";

const DEFAULT_PAGE = 1;

export function ScrapeDetailPage() {
  const { scrapeBatchId } = useParams<{ scrapeBatchId: string }>();
  const [page, setPage] = useState(DEFAULT_PAGE);

  const [mediaType, setMediaType] = useState<MediaType>(MEDIA_TYPE.ALL);

  const { data } = useScrapeBatch(scrapeBatchId!);

  const { data: mediaItems } = useMediaItems(scrapeBatchId!, {
    type: mediaType,
    offset: (page - 1) * DEFAULT_LIMIT,
    limit: DEFAULT_LIMIT,
  });

  const maxPage = useMemo(() => {
    if (!mediaItems) return 1;
    return Math.ceil(mediaItems.total / DEFAULT_LIMIT);
  }, [mediaItems]);

  function handleMediaTypeChange(value: MediaType) {
    setMediaType(value);
    setPage(DEFAULT_PAGE);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1>Scrape Detail</h1>

      <div>
        <p>Total URLs: {data?.totalUrls}</p>
        <p>Status: {data?.status}</p>
      </div>

      <div className="flex justify-end">
        <MediaTypeSelect
          value={mediaType}
          onValueChange={handleMediaTypeChange}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {mediaItems?.items?.map((mediaItem) => (
          <MediaItem
            key={mediaItem.id}
            url={mediaItem.mediaUrl}
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
