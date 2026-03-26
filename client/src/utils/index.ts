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
