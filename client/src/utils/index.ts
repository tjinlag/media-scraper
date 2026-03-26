import type { KeysToCamelCase } from "@/types";

const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;

export function getUrl(rawUrl: string) {
  if (!urlRegex.test(rawUrl)) {
    return "";
  }

  return rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
}

export function getAllValidUrls(rawInput: string) {
  const duplicatedUrls = rawInput
    .split("\n")
    .map((url) => url.trim())
    .map(getUrl)
    .filter((url) => url);

  return [...new Set(duplicatedUrls)];
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function snakeToCamelInternal<T>(input: T): any {
  if (Array.isArray(input)) {
    return input.map(snakeToCamelInternal);
  }

  if (input !== null && typeof input === "object") {
    return Object.entries(input).reduce((acc, [key, value]) => {
      const newKey = toCamelCase(key);
      acc[newKey] = snakeToCamelInternal(value);
      return acc;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as any);
  }

  return input;
}

export function snakeToCamel<T>(input: T): KeysToCamelCase<T> {
  return snakeToCamelInternal(input) as KeysToCamelCase<T>;
}
