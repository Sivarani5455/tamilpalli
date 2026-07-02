import type { DictionaryEntry } from "@/types";

const dailyQuizStoragePrefix = "agarathi-daily-quiz-complete";

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getAgarathiDailyQuizStorageKey(dateKey = getLocalDateKey()) {
  return `${dailyQuizStoragePrefix}:${dateKey}`;
}

export function isAgarathiDailyQuizComplete(dateKey = getLocalDateKey()) {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(getAgarathiDailyQuizStorageKey(dateKey)) === "true";
}

export function markAgarathiDailyQuizComplete(dateKey = getLocalDateKey()) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getAgarathiDailyQuizStorageKey(dateKey), "true");
}

export function getDailySeed(dateKey = getLocalDateKey()) {
  return dateKey.split("").reduce((seed, character) => seed + character.charCodeAt(0), 0);
}

export function buildDailyDictionaryDeck(entries: DictionaryEntry[], dateKey = getLocalDateKey()) {
  const pool = [...entries];
  const result: DictionaryEntry[] = [];
  let state = getDailySeed(dateKey) || 1;

  while (pool.length > 0) {
    state = (state * 1664525 + 1013904223) % 4294967296;
    const index = state % pool.length;
    result.push(pool.splice(index, 1)[0]);
  }

  return result.slice(0, 10);
}
