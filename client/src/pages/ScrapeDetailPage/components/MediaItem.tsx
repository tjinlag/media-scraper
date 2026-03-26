import type { MediaItem } from "@/types";

interface Props {
  url: string;
  type: "image" | "video";
}

export function MediaItem({ url, type }: Props) {
  if (type === "image") {
    return (
      <img src={url} alt={url} className="max-w-40 h-auto object-contain" />
    );
  }

  return <video src={url} className="max-w-40 h-auto object-contain" />;
}

export default MediaItem;
