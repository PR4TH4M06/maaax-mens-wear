export interface CategoryOption {
  id: string;
  label: string;
}

export interface ReviewLengthOption {
  id: "short" | "medium" | "long";
  label: string;
  linesText: string;
}

export const SHOP_CONFIG = {
  name: "MAAAX MENS WEAR",
  parentGroup: "MAAAX उद्योग समूह",
  marathiTagline: "सुवर्ण उद्योगातील पहिले यशस्वी मराठी पाऊल..!",
  brandLine: "Shirts · Armani · Jeans · T-Shirts · Loafers · Undergarments",
  logoUrl: "/maaax-logo-full.png",

  // Contact & Location Details
  phone: "9145457273",
  phoneDisplay: "+91 91454 57273",
  whatsappNumber: "919145457273",
  whatsappMessage: "Hello MAAAX MENS WEAR!",

  // Google Review & Maps (Exact Official Google Maps Satellite Embed for https://share.google/nnSQvLHpOGO6dVGo8)
  googlePlaceId: "ChIJZXaelh_r3TsRmsisHq-cmE8",
  googleReviewUrl:
    "https://search.google.com/local/writereview?placeid=ChIJZXaelh_r3TsRmsisHq-cmE8",
  directionsUrl: "https://share.google/nnSQvLHpOGO6dVGo8",
  mapCoordinates: {
    lat: 19.9818952,
    lng: 73.7478229,
  },
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3749.6249267480775!2d73.7478229!3d19.9818952!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bddeb1f969e7665%3A0x4f989caf1eacc89a!2sMAAAX%20MENS%20HUB%20(%20KHUTWAD%20NAGAR%20)!5e1!3m2!1sen!2sin!4v1790764980232!5m2!1sen!2sin",

  // Social Links (Easily editable)
  socials: {
    instagram: "https://www.instagram.com/maaax_wholesaler?mdxt=OGxpYWtmYzNyaXVx",
    whatsapp: "https://wa.me/919145457273",
  },

  // Address
  address: "MAAAX MENS WEAR, Khutwad Nagar, Nashik, Maharashtra",

  // All-English Category Filter Chips (Expanded with more combinations)
  categories: [
    { id: "all", label: "All" },
    { id: "clothes", label: "Great Collection" },
    { id: "staff", label: "Polite Staff" },
    { id: "quality", label: "Premium Quality" },
    { id: "fitting", label: "Perfect Fitting" },
    { id: "pricing", label: "Best Price" },
    { id: "loafers", label: "Jeans & Loafers" },
    { id: "partywear", label: "Party & Formal Wear" },
    { id: "offers", label: "Deals & Combos" },
  ] as CategoryOption[],

  // Review Length Selector (How many lines of review)
  reviewLengths: [
    { id: "short", label: "1–2 Lines", linesText: "Short & Crisp" },
    { id: "medium", label: "2–3 Lines", linesText: "Balanced" },
    { id: "long", label: "4–5 Lines", linesText: "Detailed" },
  ] as ReviewLengthOption[],

  // What we offer list
  offerings: [
    "Premium Shirts – ₹500/-*",
    "Armani Trousers & Formals – ₹400/-*",
    "Designer Denim Jeans – ₹800/-*",
    "Trendy T-Shirts – ₹300/-*",
    "Luxury Loafers (Loffer) – ₹500/-*",
    "Flat 20% Off On Undergarments",
  ],
};

export type ShopConfig = typeof SHOP_CONFIG;
