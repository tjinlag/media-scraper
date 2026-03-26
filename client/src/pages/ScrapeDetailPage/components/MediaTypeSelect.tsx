import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MediaType } from "@/types";

interface Props {
  value: MediaType;
  onValueChange: (value: MediaType) => void;
}

export function MediaTypeSelect({ value, onValueChange }: Props) {
  return (
    <Select
      value={value}
      onValueChange={(value) => onValueChange(value as MediaType)}
    >
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Media Type" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="image">Image</SelectItem>
          <SelectItem value="video">Video</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
