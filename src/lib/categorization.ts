// ─── Default Categories ───────────────────────────────────────────────────────

export const DEFAULT_CATEGORIES = [
  { name: "Food", color: "#F59E0B", icon: "UtensilsCrossed" },
  { name: "Q-Commerce", color: "#14B8A6", icon: "Zap" },
  { name: "Shopping", color: "#8B5CF6", icon: "ShoppingBag" },
  { name: "Transport", color: "#3B82F6", icon: "Car" },
  { name: "Bills", color: "#EF4444", icon: "FileText" },
  { name: "Entertainment", color: "#EC4899", icon: "Tv" },
  { name: "Health", color: "#10B981", icon: "Heart" },
  { name: "Travel", color: "#06B6D4", icon: "Plane" },
  { name: "Education", color: "#F97316", icon: "BookOpen" },
  { name: "Other", color: "#6B7280", icon: "MoreHorizontal" },
] as const;

export type CategoryName = (typeof DEFAULT_CATEGORIES)[number]["name"];

// ─── Categorization Rules ─────────────────────────────────────────────────────

const RULES: Array<{ keywords: string[]; category: string }> = [
  {
    keywords: ["blinkit", "zepto", "instamart", "swiggy instamart", "bigbasket", "bb daily", "dmart", "jiomart", "rapido stores", "stry", "leverage", "quick commerce", "q-commerce", "grocery delivery", "10-minute", "10 minute"],
    category: "Q-Commerce",
  },
  {
    keywords: ["swiggy", "zomato", "dominos", "domino", "mcdonald", "kfc", "pizza", "burger", "restaurant", "cafe", "food", "eat", "dinner", "lunch", "breakfast", "bakery", "canteen"],
    category: "Food",
  },
  {
    keywords: ["uber", "ola", "rapido", "metro", "bus", "train", "auto", "cab", "taxi", "fuel", "petrol", "diesel", "transport"],
    category: "Transport",
  },
  {
    keywords: ["netflix", "spotify", "prime", "hotstar", "youtube premium", "disney", "zee5", "entertainment", "movie", "cinema", "pvr", "inox"],
    category: "Entertainment",
  },
  {
    keywords: ["amazon", "flipkart", "myntra", "ajio", "nykaa", "meesho", "snapdeal", "shopify", "ebay", "aliexpress", "wish", "etsy", "noreply", "order confirmed", "order placed", "delivery", "shipment", "package", "cart"],
    category: "E-Commerce",
  },
  {
    keywords: ["shop", "market", "mall", "store", "purchase"],
    category: "Shopping",
  },
  {
    keywords: ["electricity", "water", "internet", "broadband", "airtel", "jio", "bsnl", "vi ", "vodafone", "recharge", "bill", "emi", "rent", "utility"],
    category: "Bills",
  },
  {
    keywords: ["hospital", "clinic", "pharmacy", "medicine", "doctor", "health", "apollo", "medplus", "netmeds", "1mg", "dental", "lab", "diagnostic"],
    category: "Health",
  },
  {
    keywords: ["hotel", "flight", "airline", "indigo", "spicejet", "airindia", "booking", "makemytrip", "goibibo", "cleartrip", "travel", "trip", "vacation"],
    category: "Travel",
  },
  {
    keywords: ["coursera", "udemy", "byju", "unacademy", "school", "college", "university", "tuition", "book", "course", "education", "exam"],
    category: "Education",
  },
];

/**
 * Auto-categorize a transaction description using keyword rules.
 * Returns the matched category name, or "Other" if no match found.
 */
export function categorizeTransaction(description: string): string {
  const lower = description.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.category;
    }
  }
  return "Other";
}
