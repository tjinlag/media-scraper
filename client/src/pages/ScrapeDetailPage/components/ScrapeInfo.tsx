import { SCRAPE_BATCH_STATUS } from "@/constants";
import { useScrapeBatch } from "@/hooks/useMedia";
import { CheckIcon, LoaderCircle, XIcon } from "lucide-react";

interface ScrapeInfoProps {
  scrapeBatchId: string;
}

function ScrapeInfo({ scrapeBatchId }: ScrapeInfoProps) {
  const { data } = useScrapeBatch(scrapeBatchId);

  if (!data) {
    return null;
  }

  function getStatusInfo() {
    const statusInfo = {
      [SCRAPE_BATCH_STATUS.COMPLETED]: {
        label: "Completed",
        icon: <CheckIcon className="text-green-700" />,
      },
      [SCRAPE_BATCH_STATUS.FAILED]: {
        label: "Failed",
        icon: <XIcon className="text-red-700" />,
      },
      [SCRAPE_BATCH_STATUS.PENDING]: {
        label: "Pending",
        icon: <LoaderCircle className="text-yellow-700" />,
      },
    };

    const { label, icon } = statusInfo[data!.status];

    return (
      <div className="flex items-center gap-2">
        {label}
        {icon}
      </div>
    );
  }

  return (
    <div>
      <div>
        <b>Total URLs:</b> {data.totalUrls}
      </div>
      <div className="flex gap-2">
        <b>Status:</b> {getStatusInfo()}
      </div>
    </div>
  );
}

export default ScrapeInfo;
