import { useMemo, useState } from "react";
import { useParams } from "react-router";

import { MyPagination } from "@/components/core/MyPagination";
import { DEFAULT_LIMIT, SCRAPE_BATCH_STATUS } from "@/constants";
import { useMediaItems, useScrapeBatch } from "@/hooks/useMedia";
import { MEDIA_TYPE, type MediaType } from "@/types";

import MediaList, { MediaListSkeleton } from "./components/MediaList";
import { MediaTypeSelect } from "./components/MediaTypeSelect";
import ScrapeInfo from "./components/ScrapeInfo";

const DEFAULT_PAGE = 1;

export function ScrapeDetailPage() {
  const { scrapeBatchId } = useParams<{ scrapeBatchId: string }>();
  const [page, setPage] = useState(DEFAULT_PAGE);

  const [mediaType, setMediaType] = useState<MediaType>(MEDIA_TYPE.ALL);

  const { data: scrapeBatchDetail, error } = useScrapeBatch(scrapeBatchId!);
  const { data: mediaItems, isLoading } = useMediaItems(scrapeBatchId!, {
    type: mediaType,
    offset: (page - 1) * DEFAULT_LIMIT,
    limit: DEFAULT_LIMIT,
  });

  const maxPage = useMemo(() => {
    if (!mediaItems) return 1;
    return Math.ceil(mediaItems.total / DEFAULT_LIMIT);
  }, [mediaItems]);

  if (error) {
    return <h1>Your scrape is not found</h1>;
  }

  function handleMediaTypeChange(value: MediaType) {
    setMediaType(value);
    setPage(DEFAULT_PAGE);
  }

  const isPending = scrapeBatchDetail?.status === SCRAPE_BATCH_STATUS.PENDING;
  const itemList = mediaItems?.items || [];

  function renderMediaTypeSelect() {
    if (isPending) {
      return null;
    }

    if (itemList.length === 0 && mediaType === MEDIA_TYPE.ALL) {
      return null;
    }

    return (
      <div className="flex justify-end">
        <MediaTypeSelect
          value={mediaType}
          onValueChange={handleMediaTypeChange}
        />
      </div>
    );
  }

  function renderMediaList() {
    if (isPending) {
      return null;
    }

    if (isLoading) {
      return <MediaListSkeleton />;
    }

    if (!itemList.length) {
      if (mediaType === MEDIA_TYPE.ALL) {
        return <div>There are no media items from your URLs</div>;
      } else if (mediaType === MEDIA_TYPE.IMAGE) {
        return <div>There are no image items from your URLs</div>;
      } else if (mediaType === MEDIA_TYPE.VIDEO) {
        return <div>There are no video items from your URLs</div>;
      }
    }

    return <MediaList data={itemList} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1>Scrape Detail</h1>

      <ScrapeInfo scrapeBatchId={scrapeBatchId!} />

      {renderMediaTypeSelect()}

      {renderMediaList()}

      {!isPending && !!itemList.length && (
        <MyPagination
          currentPage={page}
          maxPage={maxPage}
          onPageChange={(page) => setPage(page)}
        />
      )}
    </div>
  );
}

export default ScrapeDetailPage;
