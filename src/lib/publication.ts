const publicationTimeZone = "Europe/Paris";

export function getCurrentPublicationDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: publicationTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

export function isPublicationAvailable(publishDate?: string | null, today = getCurrentPublicationDate()) {
  return !publishDate || publishDate <= today;
}
