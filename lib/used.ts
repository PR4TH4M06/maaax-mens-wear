// lib/used.ts
// Dual-layer Deduplication & Similarity Guard:
// 1. Server-side persistent JSON (`used-reviews.json`) + fast in-memory cache
// 2. Client-side `localStorage` history tracking
// 3. `tooSimilar()` Jaccard / Significant-Token Overlap check to prevent near-duplicate reviews

const STOP_WORDS = new Set([
  "the", "and", "for", "was", "were", "are", "with", "this", "that", "from",
  "have", "has", "had", "very", "really", "also", "too", "here", "there",
  "hai", "hain", "tha", "thi", "the", "aur", "bhi", "बहुत", "ek", "se",
  "me", "mein", "ka", "ki", "ke", "ko", "pe", "par", "to", "in", "on", "of",
  "at", "by", "an", "be", "is", "it", "so", "as", "my", "our", "your",
  "maaax", "mens", "wear", "shop", "store", "showroom", "udhyog", "udyog", "samuh"
]);

/**
 * Extracts meaningful content tokens from a review string
 */
export function tokenizeReview(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
}

/**
 * Simple fast string hash for exact deduplication
 */
export function hashReview(text: string): string {
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
  let h1 = 0xdeadbeef ^ normalized.length;
  let h2 = 0x41c6ce57 ^ normalized.length;
  for (let i = 0, ch; i < normalized.length; i++) {
    ch = normalized.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

/**
 * Checks whether two reviews are too similar in wording or structure.
 * Combines token overlap ratio, Jaccard similarity, and opening 4-word prefix match.
 */
export function tooSimilar(
  candidate: string,
  existing: string,
  threshold = 0.52
): boolean {
  if (!candidate || !existing) return false;

  const normA = candidate.toLowerCase().replace(/\s+/g, " ").trim();
  const normB = existing.toLowerCase().replace(/\s+/g, " ").trim();
  if (normA === normB) return true;

  // Check if opening 5 words are identical
  const firstWordsA = normA.split(" ").slice(0, 5).join(" ");
  const firstWordsB = normB.split(" ").slice(0, 5).join(" ");
  if (firstWordsA.length > 14 && firstWordsA === firstWordsB) {
    return true;
  }

  const tokensA = tokenizeReview(candidate);
  const tokensB = tokenizeReview(existing);
  if (tokensA.length === 0 || tokensB.length === 0) return false;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  const jaccard = union > 0 ? intersection / union : 0;
  const minOverlap =
    Math.min(setA.size, setB.size) > 0
      ? intersection / Math.min(setA.size, setB.size)
      : 0;

  return jaccard >= threshold || minOverlap >= threshold + 0.14;
}

/**
 * Checks if a candidate review is rejected against a list of past reviews
 */
export function isReviewUsedOrSimilar(
  candidate: string,
  recentReviews: string[],
  usedHashes?: Set<string>,
  threshold = 0.52
): boolean {
  const hash = hashReview(candidate);
  if (usedHashes && usedHashes.has(hash)) {
    return true;
  }

  for (let i = 0; i < recentReviews.length; i++) {
    if (tooSimilar(candidate, recentReviews[i], threshold)) {
      return true;
    }
  }
  return false;
}

// ============================================================================
// BROWSER LOCALSTORAGE HELPERS (Safe to call on client)
// ============================================================================

const CLIENT_STORAGE_KEY = "maaax_used_reviews_v1";
const CLIENT_HASH_KEY = "maaax_used_hashes_v1";
const MAX_CLIENT_HISTORY = 250;

export function getClientUsedReviews(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CLIENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getClientUsedHashes(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(CLIENT_HASH_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function markClientReviewUsed(review: string): void {
  if (typeof window === "undefined" || !review) return;
  try {
    const existing = getClientUsedReviews();
    const hashes = getClientUsedHashes();
    const h = hashReview(review);

    hashes.add(h);
    const updated = [review, ...existing.filter((r) => r !== review)].slice(
      0,
      MAX_CLIENT_HISTORY
    );

    window.localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(updated));
    window.localStorage.setItem(
      CLIENT_HASH_KEY,
      JSON.stringify(Array.from(hashes).slice(-1000))
    );
  } catch {
    // Ignore storage quota errors
  }
}
