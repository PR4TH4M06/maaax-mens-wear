// lib/used-server.ts
// Server-side persistent storage in `used-reviews.json` + in-memory cache
import fs from "fs";
import path from "path";
import { hashReview, isReviewUsedOrSimilar } from "./used";

export interface UsedReviewsData {
  hashes: string[];
  recent: string[];
  totalGenerated: number;
  updatedAt: string;
}

const FILE_PATH = path.join(process.cwd(), "used-reviews.json");
const MAX_RECENT_SERVER = 400;
const MAX_HASHES_SERVER = 5000;

// In-memory singleton cache so file I/O never slows down <20ms synthesis
let memoryCache: {
  hashes: Set<string>;
  recent: string[];
  totalGenerated: number;
  loaded: boolean;
} = {
  hashes: new Set<string>(),
  recent: [],
  totalGenerated: 0,
  loaded: false,
};

function ensureLoaded() {
  if (memoryCache.loaded) return;
  memoryCache.loaded = true;
  try {
    if (fs.existsSync(FILE_PATH)) {
      const raw = fs.readFileSync(FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw) as Partial<UsedReviewsData>;
      if (Array.isArray(parsed.hashes)) {
        memoryCache.hashes = new Set(parsed.hashes);
      }
      if (Array.isArray(parsed.recent)) {
        memoryCache.recent = parsed.recent;
      }
      if (typeof parsed.totalGenerated === "number") {
        memoryCache.totalGenerated = parsed.totalGenerated;
      }
    } else {
      const initial: UsedReviewsData = {
        hashes: [],
        recent: [],
        totalGenerated: 0,
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(FILE_PATH, JSON.stringify(initial, null, 2), "utf-8");
    }
  } catch {
    // Graceful fallback if filesystem is read-only (e.g., Vercel serverless runtime)
  }
}

export function isServerReviewRejected(
  candidate: string,
  clientExclude: string[] = [],
  threshold = 0.52
): boolean {
  ensureLoaded();
  const combinedRecent = [
    ...clientExclude.slice(0, 60),
    ...memoryCache.recent.slice(0, 120),
  ];
  return isReviewUsedOrSimilar(
    candidate,
    combinedRecent,
    memoryCache.hashes,
    threshold
  );
}

export function recordServerReviewUsed(review: string): void {
  ensureLoaded();
  const h = hashReview(review);
  memoryCache.hashes.add(h);
  memoryCache.recent = [
    review,
    ...memoryCache.recent.filter((r) => r !== review),
  ].slice(0, MAX_RECENT_SERVER);
  memoryCache.totalGenerated += 1;

  // Non-blocking persist to `used-reviews.json`
  try {
    const payload: UsedReviewsData = {
      hashes: Array.from(memoryCache.hashes).slice(-MAX_HASHES_SERVER),
      recent: memoryCache.recent,
      totalGenerated: memoryCache.totalGenerated,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFile(FILE_PATH, JSON.stringify(payload, null, 2), "utf-8", () => {});
  } catch {
    // Ignore on read-only environments
  }
}

export function getServerStats() {
  ensureLoaded();
  return {
    totalGenerated: memoryCache.totalGenerated,
    uniqueHashesTracked: memoryCache.hashes.size,
    recentBufferCount: memoryCache.recent.length,
  };
}
