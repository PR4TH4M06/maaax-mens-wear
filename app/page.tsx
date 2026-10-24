"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { SHOP_CONFIG, CategoryOption, ReviewLengthOption } from "@/lib/shop";
import {
  ReviewCategory,
  ReviewLanguage,
  ReviewLength,
  synthesizeUniqueReview,
} from "@/lib/reviews";
import {
  getClientUsedReviews,
  getClientUsedHashes,
  markClientReviewUsed,
  isReviewUsedOrSimilar,
} from "@/lib/used";

const LABELS: Record<
  ReviewLanguage,
  {
    lbl: string;
    sub: string;
    copy: string;
    done: string;
    hint: string;
    hint2: string;
    disc: string;
  }
> = {
  english: {
    lbl: "Your Review",
    sub: "Share your experience",
    copy: "Copy & Paste on Google",
    done: "Copied! Opening Google… ✓",
    hint: "Tap to copy your review, then paste it on Google.",
    hint2: "Paste it in the review box on Google. 📝",
    disc: "Edit it to match your own experience before posting.",
  },
  hinglish: {
    lbl: "Aapka Review",
    sub: "Apna experience share karein",
    copy: "Copy Karein & Google Pe Paste Karein",
    done: "Copy ho gaya! Google khul raha hai… ✓",
    hint: "Review copy karein, phir Google par paste karein.",
    hint2: "Google ke review box mein paste karein. 📝",
    disc: "Post karne se pehle ise apne experience ke hisaab se badlein.",
  },
  marathi: {
    lbl: "तुमचा रिव्ह्यू",
    sub: "तुमचा अनुभव शेअर करा",
    copy: "कॉपी करा आणि Google वर पेस्ट करा",
    done: "कॉपी झाले! Google उघडत आहे… ✓",
    hint: "रिव्ह्यू कॉपी करा आणि Google वर पेस्ट करा.",
    hint2: "Google च्या रिव्ह्यू बॉक्समध्ये पेस्ट करा. 📝",
    disc: "पोस्ट करण्यापूर्वी तुमच्या अनुभवानुसार यात बदल करू शकता.",
  },
};

export default function MaaaxReviewPage() {
  const [category, setCategory] = useState<ReviewCategory>("all");
  const [language, setLanguage] = useState<ReviewLanguage>("hinglish");
  const [length, setLength] = useState<ReviewLength>("medium");

  const [fullReview, setFullReview] = useState<string>("");
  const [displayedReview, setDisplayedReview] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Prefetch queue map: key = `${category}_${language}_${length}`
  const prefetchCacheRef = useRef<Record<string, string>>({});
  const rafRef = useRef<number | null>(null);

  // Smooth requestAnimationFrame typing animation
  const startTypingEffect = useCallback((text: string) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setDisplayedReview("");
    setIsTyping(true);

    const dur = Math.min(2400, Math.max(700, text.length * 13));
    let t0: number | null = null;

    const step = (ts: number) => {
      if (t0 === null) t0 = ts;
      const p = Math.min(1, (ts - t0) / dur);
      const chars = Math.floor(p * text.length);
      setDisplayedReview(text.slice(0, chars));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplayedReview(text);
        setIsTyping(false);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(step);
  }, []);

  // Fetch a single review from `/api/review` with instant client fallback (<20ms)
  const fetchFromEngine = useCallback(
    async (
      cat: ReviewCategory,
      lang: ReviewLanguage,
      len: ReviewLength
    ): Promise<string> => {
      const clientHistory = getClientUsedReviews();
      const clientHashes = getClientUsedHashes();

      try {
        const res = await fetch("/api/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: cat,
            language: lang,
            length: len,
            excludeReviews: clientHistory.slice(0, 50),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (
            data?.review &&
            !isReviewUsedOrSimilar(
              data.review,
              clientHistory.slice(0, 60),
              clientHashes
            )
          ) {
            return data.review;
          }
        }
      } catch {
        // Fallback to instant client synthesizer if offline
      }

      const local = synthesizeUniqueReview({
        category: cat,
        language: lang,
        length: len,
        excludeReviews: clientHistory,
        usedHashes: clientHashes,
      });

      return local.review;
    },
    []
  );

  // Prefetch next review in background so click is 0ms instant
  const prefetchNextReview = useCallback(
    async (cat: ReviewCategory, lang: ReviewLanguage, len: ReviewLength) => {
      const cacheKey = `${cat}_${lang}_${len}`;
      const nextText = await fetchFromEngine(cat, lang, len);
      prefetchCacheRef.current[cacheKey] = nextText;
    },
    [fetchFromEngine]
  );

  // Load or refresh review
  const loadReview = useCallback(
    async (
      targetCat: ReviewCategory,
      targetLang: ReviewLanguage,
      targetLen: ReviewLength
    ) => {
      setCopied(false);

      const cacheKey = `${targetCat}_${targetLang}_${targetLen}`;
      const cached = prefetchCacheRef.current[cacheKey];
      const clientHistory = getClientUsedReviews();
      const clientHashes = getClientUsedHashes();

      if (
        cached &&
        !isReviewUsedOrSimilar(cached, clientHistory.slice(0, 40), clientHashes)
      ) {
        delete prefetchCacheRef.current[cacheKey];
        markClientReviewUsed(cached);
        setFullReview(cached);
        startTypingEffect(cached);
        prefetchNextReview(targetCat, targetLang, targetLen);
        return;
      }

      const immediateLocal = synthesizeUniqueReview({
        category: targetCat,
        language: targetLang,
        length: targetLen,
        excludeReviews: clientHistory,
        usedHashes: clientHashes,
      });

      markClientReviewUsed(immediateLocal.review);
      setFullReview(immediateLocal.review);
      startTypingEffect(immediateLocal.review);
      prefetchNextReview(targetCat, targetLang, targetLen);
    },
    [prefetchNextReview, startTypingEffect]
  );

  useEffect(() => {
    loadReview("all", "hinglish", "medium");
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategoryChange = (newCat: ReviewCategory) => {
    setCategory(newCat);
    loadReview(newCat, language, length);
  };

  const handleLanguageChange = (newLang: ReviewLanguage) => {
    if (newLang === language) return;
    setLanguage(newLang);
    loadReview(category, newLang, length);
  };

  const handleLengthChange = (newLen: ReviewLength) => {
    if (newLen === length) return;
    setLength(newLen);
    loadReview(category, language, newLen);
  };

  const handleNewReviewClick = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 450);
    loadReview(category, language, length);
  };

  const handleCopyAndPost = () => {
    if (!fullReview) return;

    // Always execute synchronous textarea copy first so iOS Safari / Android WebView user-gesture is preserved
    try {
      const ta = document.createElement("textarea");
      ta.value = fullReview;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, fullReview.length);
      document.execCommand("copy");
      document.body.removeChild(ta);
    } catch {
      // ignore
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullReview).catch(() => {});
    }

    setCopied(true);
    setTimeout(() => {
      const win = window.open(
        SHOP_CONFIG.googleReviewUrl,
        "_blank",
        "noopener,noreferrer"
      );
      if (!win) {
        window.location.href = SHOP_CONFIG.googleReviewUrl;
      }
    }, 650);
  };

  const handleSaveContact = () => {
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:;${SHOP_CONFIG.name};;;`,
      `FN:${SHOP_CONFIG.name}`,
      `ORG:${SHOP_CONFIG.name} (${SHOP_CONFIG.parentGroup})`,
      `TEL;TYPE=CELL,VOICE,PREF:+91${SHOP_CONFIG.phone}`,
      `ADR;TYPE=WORK:;;${SHOP_CONFIG.address};;;;India`,
      `URL:${SHOP_CONFIG.socials.instagram}`,
      "END:VCARD",
    ].join("\n");

    const url = URL.createObjectURL(new Blob([vcard], { type: "text/vcard" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "MAAAX_MENS_WEAR.vcf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const s = LABELS[language];

  return (
    <>
      <div className="bar" />
      <div className="page">
        {/* Clean Original Logo & Brand Name + Separator Line */}
        <div className="logo-wrap">
          <img
            src={SHOP_CONFIG.logoUrl}
            alt={SHOP_CONFIG.name}
            className="logo-img"
          />
          <h1 className="logo-title">{SHOP_CONFIG.name}</h1>
          <div className="logo-line" />
        </div>

        <div className="brand">{SHOP_CONFIG.brandLine}</div>
        <div className="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
        <div className="sub">{s.sub}</div>

        {/* All-English Category Filter Chips */}
        <div className="cats">
          <div className="row">
            {SHOP_CONFIG.categories.map((cat: CategoryOption) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id as ReviewCategory)}
                className={`chip ${category === cat.id ? "on" : ""}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language Toggle (English / Hinglish / Marathi) + Review Lines Length Selector */}
        <div className="controls-bar">
          <div className="lang" aria-label="Language">
            <button
              type="button"
              onClick={() => handleLanguageChange("english")}
              className={language === "english" ? "on" : ""}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange("hinglish")}
              className={language === "hinglish" ? "on" : ""}
            >
              Hinglish
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange("marathi")}
              className={language === "marathi" ? "on" : ""}
            >
              मराठी
            </button>
          </div>

          <div className="lang" aria-label="Review Length in Lines">
            {SHOP_CONFIG.reviewLengths.map((opt: ReviewLengthOption) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleLengthChange(opt.id)}
                className={length === opt.id ? "on" : ""}
                title={opt.linesText}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Review Card */}
        <div className="card">
          <div className="lbl">
            {s.lbl} ({SHOP_CONFIG.reviewLengths.find((l) => l.id === length)?.label})
          </div>
          <div id="rv" className={isTyping ? "typing" : ""}>
            {displayedReview}
          </div>
          <div className="div" />
          <div className="btns">
            <button
              type="button"
              onClick={handleCopyAndPost}
              className={`cta ${copied ? "ok" : ""}`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>{copied ? s.done : s.copy}</span>
            </button>
            <button
              type="button"
              onClick={handleNewReviewClick}
              className={`new ${isSpinning ? "spin" : ""}`}
              title="New review"
              aria-label="New review"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </button>
          </div>
          <div className="hint">{copied ? s.hint2 : s.hint}</div>
          <div className="disc">{s.disc}</div>
        </div>

        {/* 5 Circular Icon Buttons (Instagram, WhatsApp, Call Us, Get Directions, Save Contact) */}
        <div className="icons">
          <a
            className="ib"
            href={SHOP_CONFIG.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </i>
            Instagram
          </a>

          <a
            className="ib"
            href={SHOP_CONFIG.socials.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.85-1.47A10 10 0 1 0 12 2zm0 18.15a8.1 8.1 0 0 1-4.15-1.14l-.298-.177-3.08.933.94-2.98-.194-.307A8.15 8.15 0 1 1 12 20.15z" />
              </svg>
            </i>
            WhatsApp
          </a>

          <a className="ib" href={`tel:+91${SHOP_CONFIG.phone}`}>
            <i>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </i>
            Call Us
          </a>

          <a
            className="ib"
            href={SHOP_CONFIG.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </i>
            Get
            <br />
            Directions
          </a>

          <button
            type="button"
            className="ib"
            onClick={handleSaveContact}
            aria-label="Save Contact"
          >
            <i>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </i>
            Save
            <br />
            Contact
          </button>
        </div>

        {/* Address & Phone */}
        <div className="addr">
          {SHOP_CONFIG.address}
          <br />
          &#9742; {SHOP_CONFIG.phoneDisplay}
        </div>

        {/* Google Map Embed (Exact Official Google Maps Satellite Embed for https://share.google/nnSQvLHpOGO6dVGo8) */}
        <div className="map">
          <iframe
            title={`${SHOP_CONFIG.name} Map`}
            src={SHOP_CONFIG.mapEmbedUrl}
            width="600"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>

        {/* What we offer */}
        <div className="info">
          <h3>What we offer</h3>
          <ul>
            {SHOP_CONFIG.offerings.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
