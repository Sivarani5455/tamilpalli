export function normalizeImageUrl(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return "";
  }

  const withProtocol = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
  const wikimediaFileMatch =
    withProtocol.match(/\/wiki\/[^#]*#\/media\/(?:File|Fichier):([^?#]+)/i) ??
    withProtocol.match(/\/wiki\/(?:File|Fichier):([^?#]+)/i);

  if (wikimediaFileMatch?.[1]) {
    return `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(
      decodeURIComponent(wikimediaFileMatch[1]),
    )}`;
  }

  return withProtocol;
}
