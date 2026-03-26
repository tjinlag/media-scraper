import { Skeleton } from "@/components/ui/skeleton";
import { MediaItem } from "./MediaItem";
import { type MediaItem as MediaItemType } from "@/types";
import { DEFAULT_LIMIT } from "@/constants";

interface MediaListProps {
  data: MediaItemType[];
}

function MediaList({ data }: MediaListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {data.map((item) => (
        <MediaItem key={item.id} url={item.mediaUrl} type={item.type} />
      ))}
    </div>
  );
}

export function MediaListSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: DEFAULT_LIMIT }).map((_, index) => (
        <Skeleton key={index} className="w-48 h-48" />
      ))}
    </div>
  );
}

export default MediaList;
