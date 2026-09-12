/**
 * Central government schemes for farmers.
 *
 * Intended source: the API Setu "myScheme" collection
 * (https://sandbox.api-setu.in/org-collections/myscheme). That collection is
 * still marked "Coming Soon in Sandbox" and exposes no endpoints, and
 * myScheme's own API (api.myscheme.gov.in) rejects unauthenticated calls with
 * a 401. Until either becomes usable, this curated catalogue backs the UI.
 *
 * `/api/schemes` is the single read path, so swapping in the live API later
 * means changing that route only — no component touches this file directly.
 */

export type SchemeCategory =
  | "income"
  | "insurance"
  | "credit"
  | "irrigation"
  | "energy"
  | "market"
  | "infrastructure"
  | "soil"
  | "horticulture"
  | "allied"
  | "mechanization"
  | "organic";

export interface GovScheme {
  id: string;
  name: string;
  shortName: string;
  ministry: string;
  category: SchemeCategory;
  description: string;
  benefits: string[];
  eligibility: string[];
  url: string;
  icon: string;
  launched?: string;
}

export const SCHEME_CATEGORIES: { id: SchemeCategory; label: string; icon: string }[] = [
  { id: "income", label: "Income Support", icon: "💰" },
  { id: "insurance", label: "Crop Insurance", icon: "🛡️" },
  { id: "credit", label: "Credit & Loans", icon: "🏦" },
  { id: "irrigation", label: "Irrigation", icon: "💧" },
  { id: "energy", label: "Solar & Energy", icon: "☀️" },
  { id: "market", label: "Market Access", icon: "🏪" },
  { id: "infrastructure", label: "Infrastructure", icon: "🏗️" },
  { id: "soil", label: "Soil & Seeds", icon: "🌱" },
  { id: "horticulture", label: "Horticulture", icon: "🍎" },
  { id: "allied", label: "Livestock & Fisheries", icon: "🐄" },
  { id: "mechanization", label: "Farm Machinery", icon: "🚜" },
  { id: "organic", label: "Natural Farming", icon: "🍃" },
];

export const GOVERNMENT_SCHEMES: GovScheme[] = [
  {
    id: "pm-kisan",
    name: "Pradhan Mantri Kisan Samman Nidhi",
    shortName: "PM-KISAN",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "income",
    description:
      "Direct income support to landholding farmer families, paid straight into the beneficiary's bank account through DBT.",
    benefits: [
      "₹6,000 per year in three equal instalments of ₹2,000",
      "Paid directly to the bank account via DBT",
      "No intermediaries or application fee",
    ],
    eligibility: [
      "Landholding farmer families with cultivable land",
      "Aadhaar-linked bank account and completed e-KYC",
      "Excludes income-tax payers and institutional landholders",
    ],
    url: "https://pmkisan.gov.in/",
    icon: "👨‍🌾",
    launched: "February 2019",
  },
  {
    id: "pmfby",
    name: "Pradhan Mantri Fasal Bima Yojana",
    shortName: "PMFBY",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "insurance",
    description:
      "Crop insurance covering yield losses from natural calamities, pests and disease, with the premium above the farmer's share met by government subsidy.",
    benefits: [
      "Farmer premium capped at 2% for kharif and 1.5% for rabi food crops",
      "5% cap for commercial and horticultural crops",
      "Covers prevented sowing, mid-season adversity and post-harvest losses",
    ],
    eligibility: [
      "All farmers growing notified crops in notified areas",
      "Both loanee and non-loanee farmers, enrolment voluntary",
      "Sharecroppers and tenant farmers with valid documents",
    ],
    url: "https://pmfby.gov.in/",
    icon: "🛡️",
    launched: "2016",
  },
  {
    id: "kcc",
    name: "Kisan Credit Card",
    shortName: "KCC",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "credit",
    description:
      "Short-term working capital for cultivation, post-harvest expenses and allied activities, at a concessional interest rate with prompt-repayment incentives.",
    benefits: [
      "Concessional interest with an additional rebate for prompt repayment",
      "Flexible drawing limit through a revolving cash-credit account",
      "Extends to animal husbandry and fisheries",
    ],
    eligibility: [
      "Owner cultivators, tenant farmers, oral lessees and sharecroppers",
      "Self-help groups and joint liability groups of farmers",
      "Farmers engaged in allied and fisheries activities",
    ],
    url: "https://www.myscheme.gov.in/schemes/kcc",
    icon: "💳",
    launched: "1998",
  },
  {
    id: "pm-kusum",
    name: "Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan",
    shortName: "PM-KUSUM",
    ministry: "Ministry of New & Renewable Energy",
    category: "energy",
    description:
      "Solarisation of agricultural pumps and decentralised solar generation, cutting diesel dependence and creating a second income from surplus power.",
    benefits: [
      "Subsidy on standalone solar agricultural pumps",
      "Solarisation of existing grid-connected pumps",
      "Income from selling surplus power to the grid",
    ],
    eligibility: [
      "Individual farmers, groups and cooperatives",
      "Farmer Producer Organisations and water user associations",
      "Panchayats undertaking eligible solar projects",
    ],
    url: "https://pmkusum.mnre.gov.in/",
    icon: "☀️",
    launched: "2019",
  },
  {
    id: "soil-health-card",
    name: "Soil Health Card Scheme",
    shortName: "SHC",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "soil",
    description:
      "Field-level soil testing that reports nutrient status and gives crop-wise fertiliser recommendations, reducing input cost and over-application.",
    benefits: [
      "Soil nutrient report for the farmer's own holding",
      "Crop-wise fertiliser and amendment recommendations",
      "Lower input spend and improved soil health over time",
    ],
    eligibility: [
      "All farmers, irrespective of landholding size",
      "Samples collected through the state agriculture department",
    ],
    url: "https://soilhealth.dac.gov.in/",
    icon: "🌱",
    launched: "2015",
  },
  {
    id: "enam",
    name: "National Agriculture Market",
    shortName: "eNAM",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "market",
    description:
      "An electronic trading platform networking APMC mandis nationwide, letting farmers discover prices beyond their local mandi.",
    benefits: [
      "Transparent online price discovery and bidding",
      "Access to buyers outside the local mandi",
      "Direct online payment to the farmer's account",
    ],
    eligibility: [
      "Farmers registered with a participating mandi",
      "Traders and commission agents with eNAM licences",
      "Farmer Producer Organisations",
    ],
    url: "https://www.enam.gov.in/",
    icon: "🏪",
    launched: "2016",
  },
  {
    id: "aif",
    name: "Agriculture Infrastructure Fund",
    shortName: "AIF",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "infrastructure",
    description:
      "Medium- and long-term financing for post-harvest management infrastructure and community farming assets, with interest subvention and credit guarantee support.",
    benefits: [
      "Interest subvention on eligible loans",
      "Credit guarantee cover for smaller borrowers",
      "Funds cold storage, warehouses, grading and sorting units",
    ],
    eligibility: [
      "Farmers, FPOs, primary agricultural credit societies",
      "Self-help groups, joint liability groups and cooperatives",
      "Agri-entrepreneurs and start-ups",
    ],
    url: "https://agriinfra.dac.gov.in/",
    icon: "🏗️",
    launched: "2020",
  },
  {
    id: "pmksy",
    name: "Pradhan Mantri Krishi Sinchayee Yojana",
    shortName: "PMKSY",
    ministry: "Ministry of Jal Shakti / Agriculture",
    category: "irrigation",
    description:
      "Expands assured irrigation coverage and promotes water-use efficiency under the 'Har Khet Ko Pani' and 'Per Drop More Crop' components.",
    benefits: [
      "Subsidy on drip and sprinkler micro-irrigation systems",
      "Support for farm ponds and water-harvesting structures",
      "Higher water-use efficiency and reduced pumping cost",
    ],
    eligibility: [
      "All categories of farmers with cultivable land",
      "Applications routed through the state agriculture or horticulture department",
    ],
    url: "https://pmksy.gov.in/",
    icon: "💧",
    launched: "2015",
  },
  {
    id: "smam",
    name: "Sub-Mission on Agricultural Mechanization",
    shortName: "SMAM",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "mechanization",
    description:
      "Subsidised access to farm machinery and custom hiring centres, aimed at small and marginal farmers who cannot buy equipment outright.",
    benefits: [
      "Subsidy on tractors, implements and harvesting equipment",
      "Support for establishing custom hiring centres",
      "Higher assistance for SC/ST, small, marginal and women farmers",
    ],
    eligibility: [
      "Individual farmers and groups of farmers",
      "FPOs, cooperatives and rural entrepreneurs",
      "Registration through the state agriculture department portal",
    ],
    url: "https://agrimachinery.nic.in/",
    icon: "🚜",
    launched: "2014",
  },
  {
    id: "midh",
    name: "Mission for Integrated Development of Horticulture",
    shortName: "MIDH",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "horticulture",
    description:
      "Holistic support for fruits, vegetables, spices, flowers and plantation crops, spanning planting material, protected cultivation and post-harvest handling.",
    benefits: [
      "Assistance for nurseries and quality planting material",
      "Support for greenhouses, shade nets and polyhouses",
      "Cold chain and post-harvest infrastructure support",
    ],
    eligibility: [
      "Farmers taking up horticulture crops",
      "Self-help groups, FPOs and cooperatives",
      "Applications through state horticulture missions",
    ],
    url: "https://midh.gov.in/",
    icon: "🍎",
    launched: "2014",
  },
  {
    id: "nmnf",
    name: "National Mission on Natural Farming",
    shortName: "NMNF",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "organic",
    description:
      "Promotes chemical-free farming built on on-farm biomass recycling, bio-inputs and traditional practices, with cluster-based handholding and certification support.",
    benefits: [
      "Assistance for bio-input resource centres and inputs",
      "Cluster-based training and farmer handholding",
      "Certification and branding support for natural produce",
    ],
    eligibility: [
      "Farmers willing to adopt natural farming practices",
      "Preference for cluster and group-based adoption",
    ],
    url: "https://naturalfarming.dac.gov.in/",
    icon: "🍃",
    launched: "2023",
  },
  {
    id: "fpo-scheme",
    name: "Formation and Promotion of 10,000 Farmer Producer Organisations",
    shortName: "10,000 FPOs",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "market",
    description:
      "Builds farmer-owned collectives so smallholders gain bargaining power in input purchase and produce marketing.",
    benefits: [
      "Financial assistance to each FPO over its formative years",
      "Equity grant and credit guarantee support",
      "Training in business planning and market linkage",
    ],
    eligibility: [
      "Groups of farmers forming a producer company or cooperative",
      "Facilitated through designated implementing agencies",
    ],
    url: "https://www.myscheme.gov.in/schemes/fpo",
    icon: "🤝",
    launched: "2020",
  },
  {
    id: "pmmsy",
    name: "Pradhan Mantri Matsya Sampada Yojana",
    shortName: "PMMSY",
    ministry: "Department of Fisheries",
    category: "allied",
    description:
      "Develops fisheries and aquaculture as an allied income stream, covering pond construction, inputs, cold chain and marketing.",
    benefits: [
      "Subsidy for pond construction and aquaculture inputs",
      "Support for fish transport, ice plants and cold chain",
      "Higher assistance for SC/ST and women beneficiaries",
    ],
    eligibility: [
      "Fishers, fish farmers and fish workers",
      "Self-help groups, FPOs and cooperatives in fisheries",
      "Entrepreneurs setting up fisheries units",
    ],
    url: "https://pmmsy.dof.gov.in/",
    icon: "🐟",
    launched: "2020",
  },
  {
    id: "nlm",
    name: "National Livestock Mission",
    shortName: "NLM",
    ministry: "Department of Animal Husbandry & Dairying",
    category: "allied",
    description:
      "Supports entrepreneurship in poultry, sheep, goat and piggery, along with feed and fodder development for livestock-keeping households.",
    benefits: [
      "Capital subsidy for livestock entrepreneurship units",
      "Support for feed and fodder production",
      "Risk management and insurance components",
    ],
    eligibility: [
      "Individual farmers and livestock keepers",
      "Self-help groups, FPOs and Section 8 companies",
      "Entrepreneurs setting up breeding or fodder units",
    ],
    url: "https://nlm.udyamimitra.in/",
    icon: "🐄",
    launched: "2014",
  },
];

/** Filter the catalogue by free-text query and/or category. */
export function filterSchemes(
  schemes: GovScheme[],
  opts: { query?: string; category?: string }
): GovScheme[] {
  const { query, category } = opts;
  let out = schemes;

  if (category && category !== "all") {
    out = out.filter((s) => s.category === category);
  }

  if (query) {
    const q = query.toLowerCase().trim();
    out = out.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.shortName.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.ministry.toLowerCase().includes(q)
    );
  }

  return out;
}
