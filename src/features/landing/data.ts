import type {
  AIRecommendation,
  FAQItem,
  KPIStat,
  PricingPlan,
  Testimonial,
} from "@/types";

export const kpiStats: KPIStat[] = [
  { id: "decisions", label: "Decisions surfaced monthly", value: "42,000+" },
  { id: "accuracy", label: "Recommendation accuracy", value: "94.2%" },
  { id: "time-saved", label: "Hours saved per finance lead", value: "11 hrs/wk" },
  { id: "smes", label: "SMEs running on FinPilot", value: "1,280" },
];

export const heroRecommendation: AIRecommendation = {
  id: "rec-001",
  title: "Delay the warehouse lease renewal by 45 days",
  reasoning:
    "Cash runway drops below your 60-day safety threshold in week 7 if the renewal is signed at the current rate. Vendor payment terms on your two largest suppliers free up $18,400 if renegotiated first.",
  confidence: 87,
  impact: {
    amount: 18400,
    currency: "USD",
    direction: "positive",
    horizon: "next 45 days",
  },
  alternatives: [
    "Renew now and draw down the credit line",
    "Negotiate a 3-month short-term extension",
    "Sublet 20% of warehouse space to offset cost",
  ],
  category: "cash-flow",
};

export const dashboardRecommendations: AIRecommendation[] = [
  heroRecommendation,
  {
    id: "rec-002",
    title: "Shift $6,200 of ad spend from Channel B to Channel A",
    reasoning:
      "Channel A's cost-per-acquisition has dropped 22% over 3 weeks while Channel B plateaued. Reallocating preserves total spend but lifts projected monthly revenue.",
    confidence: 79,
    impact: { amount: 9100, currency: "USD", direction: "positive", horizon: "30 days" },
    alternatives: ["Keep current split", "Pause Channel B entirely", "Test a 50/50 split for 2 weeks"],
    category: "revenue",
  },
  {
    id: "rec-003",
    title: "Hold off on the second warehouse hire until Q3",
    reasoning:
      "Order volume growth is trending 6% below the forecast that justified the hire. Current headcount can absorb demand through the next 8 weeks without overtime risk.",
    confidence: 71,
    impact: { amount: 14200, currency: "USD", direction: "positive", horizon: "this quarter" },
    alternatives: ["Hire now per original plan", "Bring on a part-time contractor", "Revisit in 4 weeks with fresh data"],
    category: "hiring",
  },
];

export const features = [
  {
    id: "explainable-ai",
    title: "Explainable, not a black box",
    description:
      "Every recommendation ships with the reasoning, the confidence score, and the alternatives you didn't take — so you can defend the decision to your board, not just your gut.",
  },
  {
    id: "cash-flow-prediction",
    title: "Cash flow prediction",
    description:
      "See the shape of your runway 90 days out, updated as new transactions land, with early warnings before a shortfall becomes a crisis.",
  },
  {
    id: "expense-optimization",
    title: "Expense optimization",
    description:
      "FinPilot flags spend that's drifted from your historical baseline and ranks the cuts that matter most by dollar impact, not alphabetical order.",
  },
  {
    id: "revenue-opportunities",
    title: "Revenue opportunity finder",
    description:
      "Surface underpriced products, churn-risk accounts, and channels with rising efficiency — ranked by expected impact and confidence.",
  },
  {
    id: "hiring-investment",
    title: "Hiring & investment timing",
    description:
      "Know whether this is the month to hire, buy equipment, or hold cash — backed by the same reasoning engine, not a hunch.",
  },
  {
    id: "ceo-brief",
    title: "Daily CEO brief",
    description:
      "A two-minute morning read: what changed overnight, what needs a decision today, and what can wait.",
  },
] as const;

export const howItWorks = [
  {
    step: "Connect",
    title: "Upload or connect your financial data",
    description: "Drop in a CSV, an Excel export, or connect your existing accounting stack in minutes.",
  },
  {
    step: "Analyze",
    title: "FinPilot reads the full financial picture",
    description: "The AI engine builds a live model of cash flow, revenue, expenses, and risk — continuously updated.",
  },
  {
    step: "Decide",
    title: "Act on ranked, explained recommendations",
    description: "Every recommendation shows its reasoning, confidence, and financial impact before you commit.",
  },
] as const;

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "FinPilot caught a cash flow gap six weeks before it would have hit us. The reasoning behind the recommendation was the part that actually built trust with my co-founder.",
    name: "Priya Raman",
    role: "Founder & CEO",
    company: "Loomtrail",
  },
  {
    id: "t2",
    quote:
      "We stopped guessing on hiring timing. The confidence score gives us a shared number to argue about instead of two gut feelings.",
    name: "David Okafor",
    role: "COO",
    company: "Harborline Goods",
  },
  {
    id: "t3",
    quote:
      "It reads like a finance partner wrote it, not a dashboard. The daily brief is the first thing I open every morning.",
    name: "Mei Lin Tan",
    role: "Founder",
    company: "Ferro & Finch",
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$49",
    cadence: "/month",
    description: "For solo founders getting their first real financial signal.",
    features: ["1 connected entity", "Daily CEO brief", "Cash flow prediction", "Email support"],
    cta: "Start free trial",
  },
  {
    id: "growth",
    name: "Growth",
    price: "$149",
    cadence: "/month",
    description: "For SMEs making weekly financial calls across a small team.",
    features: [
      "Up to 5 connected entities",
      "Full AI recommendation engine",
      "Expense & revenue optimization",
      "Team seats (5 included)",
      "Priority support",
    ],
    highlighted: true,
    cta: "Start free trial",
  },
  {
    id: "scale",
    name: "Scale",
    price: "Custom",
    cadence: "",
    description: "For multi-entity operators and finance teams with reporting needs.",
    features: [
      "Unlimited entities",
      "Custom risk thresholds",
      "Advanced reporting & exports",
      "Dedicated onboarding",
      "SLA-backed support",
    ],
    cta: "Talk to sales",
  },
];

export const faqItems: FAQItem[] = [
  {
    id: "f1",
    question: "Is FinPilot AI accounting software?",
    answer:
      "No. FinPilot doesn't replace your books — it reads your financial data and tells you what decision to make next, with the reasoning behind it. It connects to or imports from the accounting tools you already use.",
  },
  {
    id: "f2",
    question: "How is the confidence score calculated?",
    answer:
      "Confidence reflects the strength and consistency of the underlying signal — how much historical data supports the pattern, how recently it held true, and how sensitive the recommendation is to a single outlier transaction.",
  },
  {
    id: "f3",
    question: "What file formats can I upload?",
    answer: "CSV and Excel (.xlsx) today, with drag-and-drop import, column validation, and an import status preview before anything is committed.",
  },
  {
    id: "f4",
    question: "Can I see why FinPilot didn't recommend an alternative?",
    answer:
      "Yes — every recommendation lists the alternatives that were considered and weighed against the one FinPilot ranked highest, so the decision is auditable, not just asserted.",
  },
  {
    id: "f5",
    question: "Is my financial data secure?",
    answer:
      "Data is encrypted in transit and at rest, access is scoped per user role, and you control exactly which entities and integrations are connected at any time.",
  },
];
