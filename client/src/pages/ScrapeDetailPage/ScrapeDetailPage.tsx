import { useMemo, useState } from "react";
import { useParams } from "react-router";

import { MyPagination } from "@/components/core/MyPagination";
import { DEFAULT_LIMIT } from "@/constants";
import { useMediaItems } from "@/hooks/useMedia";
import { MEDIA_TYPE, type MediaType } from "@/types";

import MediaList, { MediaListSkeleton } from "./components/MediaList";
import { MediaTypeSelect } from "./components/MediaTypeSelect";
import ScrapeInfo from "./components/ScrapeInfo";

const DEFAULT_PAGE = 1;

export function ScrapeDetailPage() {
  const { scrapeBatchId } = useParams<{ scrapeBatchId: string }>();
  const [page, setPage] = useState(DEFAULT_PAGE);

  const [mediaType, setMediaType] = useState<MediaType>(MEDIA_TYPE.ALL);

  const { data: mediaItems, isLoading } = useMediaItems(scrapeBatchId!, {
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

      <ScrapeInfo scrapeBatchId={scrapeBatchId!} />

      <div className="flex justify-end">
        <MediaTypeSelect
          value={mediaType}
          onValueChange={handleMediaTypeChange}
        />
      </div>

      {isLoading ? (
        <MediaListSkeleton />
      ) : (
        <MediaList data={mediaItems?.items || []} />
      )}

      <MyPagination
        currentPage={page}
        maxPage={maxPage}
        onPageChange={(page) => setPage(page)}
      />
    </div>
  );
}

export default ScrapeDetailPage;
