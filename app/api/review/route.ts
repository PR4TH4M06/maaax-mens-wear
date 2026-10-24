import { NextRequest, NextResponse } from "next/server";
import {
  generateSmartReview,
  ReviewCategory,
  ReviewLanguage,
  ReviewLength,
} from "@/lib/reviews";
import {
  isServerReviewRejected,
  recordServerReviewUsed,
  getServerStats,
} from "@/lib/used-server";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES: ReviewCategory[] = [
  "all",
  "clothes",
  "staff",
  "quality",
  "fitting",
  "pricing",
  "loafers",
  "partywear",
  "offers",
];

const VALID_LENGTHS: ReviewLength[] = ["short", "medium", "long"];

function parseCategory(raw?: string | null): ReviewCategory {
  if (!raw) return "all";
  const lower = raw.toLowerCase().trim() as ReviewCategory;
  return VALID_CATEGORIES.includes(lower) ? lower : "all";
}

function parseLanguage(raw?: string | null): ReviewLanguage {
  if (!raw) return "hinglish";
  const lower = raw.toLowerCase().trim();
  if (lower === "english") return "english";
  if (lower === "marathi") return "marathi";
  return "hinglish";
}

function parseLength(raw?: string | null): ReviewLength {
  if (!raw) return "medium";
  const lower = raw.toLowerCase().trim() as ReviewLength;
  return VALID_LENGTHS.includes(lower) ? lower : "medium";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = parseCategory(searchParams.get("category"));
  const language = parseLanguage(searchParams.get("language"));
  const length = parseLength(searchParams.get("length"));

  const result = await generateSmartReview({
    category,
    language,
    length,
    customValidator: (candidate) => isServerReviewRejected(candidate, []),
  });

  recordServerReviewUsed(result.review);

  return NextResponse.json({
    ...result,
    stats: getServerStats(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const category = parseCategory(body.category);
    const language = parseLanguage(body.language);
    const length = parseLength(body.length);
    const excludeReviews: string[] = Array.isArray(body.excludeReviews)
      ? body.excludeReviews.slice(0, 60)
      : [];

    const result = await generateSmartReview({
      category,
      language,
      length,
      excludeReviews,
      customValidator: (candidate) =>
        isServerReviewRejected(candidate, excludeReviews),
    });

    recordServerReviewUsed(result.review);

    return NextResponse.json({
      ...result,
      stats: getServerStats(),
    });
  } catch {
    const fallback = await generateSmartReview({
      category: "all",
      language: "hinglish",
      length: "medium",
    });
    recordServerReviewUsed(fallback.review);
    return NextResponse.json(fallback);
  }
}
