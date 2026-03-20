import { Asset } from "@/lib/types";

export const MOCK_ASSETS: Asset[] = [
  {
    id: "asset-001",
    name: "Geneva Residential Tower",
    category: "real-estate",
    description:
      "Prime residential tower in Geneva's financial district with 120 luxury apartments.",
    longDescription:
      "Located in the heart of Geneva's prestigious financial district, this 24-story residential tower offers 120 fully-furnished luxury apartments with panoramic views of Lake Geneva and the Alps. The asset is fully leased to high-net-worth individuals and corporate tenants, generating stable rental income. The property features sustainable energy systems, concierge services, and underground parking.",
    image:
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    location: "Geneva, Switzerland",
    totalValue: 8_500_000,
    tokenSupply: 85_000,
    tokenPrice: 100,
    projectedYield: 6.2,
    liquidityScore: 8,
    minInvestment: 100,
    funded: 73,
    tags: ["residential", "prime-location", "ESG"],
    highlights: [
      "120 luxury apartments, fully leased",
      "6.2% annual yield paid quarterly",
      "LEED Gold certified building",
      "Managed by Helvetica Asset Management",
    ],
  },
  {
    id: "asset-002",
    name: "Solar Farm Alpha",
    category: "infrastructure",
    description:
      "100 MW solar farm in southern France with 20-year PPA agreements.",
    longDescription:
      "A utility-scale 100 MW photovoltaic solar installation spanning 200 hectares in the Occitanie region of southern France. The project operates under 20-year Power Purchase Agreements (PPA) with EDF, providing highly predictable cash flows. Annual production capacity of 180 GWh supports approximately 50,000 households. Carbon credits add additional revenue upside.",
    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80",
    location: "Occitanie, France",
    totalValue: 5_200_000,
    tokenSupply: 52_000,
    tokenPrice: 100,
    projectedYield: 7.8,
    liquidityScore: 7,
    minInvestment: 100,
    funded: 58,
    tags: ["green-energy", "infrastructure", "PPA"],
    highlights: [
      "20-year PPA with EDF (investment grade)",
      "7.8% IRR with carbon credit upside",
      "180 GWh annual production capacity",
      "Fully operational since 2022",
    ],
  },
  {
    id: "asset-003",
    name: "Basquiat — Untitled No. 7",
    category: "art",
    description:
      "Authenticated Jean-Michel Basquiat canvas from the 1983 New York series.",
    longDescription:
      "A 1983 mixed-media canvas by Jean-Michel Basquiat, authenticated by the Authentication Committee and held in climate-controlled storage at the Geneva Freeport. The work was acquired at Sotheby's New York in 2019 and has been valued twice since by Christie's expert panel. Basquiat's market has shown consistent 12–15% CAGR over the past decade, underpinned by institutional collector demand.",
    image:
      "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80",
    location: "Geneva Freeport, Switzerland",
    totalValue: 1_800_000,
    tokenSupply: 18_000,
    tokenPrice: 100,
    projectedYield: 12.4,
    liquidityScore: 5,
    minInvestment: 100,
    funded: 41,
    tags: ["blue-chip-art", "alternative", "appreciation"],
    highlights: [
      "Authenticated by Basquiat Authentication Committee",
      "12.4% CAGR (art market comparable)",
      "Stored at Geneva Freeport (tax advantaged)",
      "Fully insured at Lloyds of London",
    ],
  },
  {
    id: "asset-004",
    name: "Bordeaux Grand Cru Reserve",
    category: "wine",
    description:
      "Château Pétrus 2009–2015 vertical — 600 bottles in bonded storage.",
    longDescription:
      "A curated collection of 600 bottles from Château Pétrus spanning the exceptional 2009–2015 vintages, held in bonded storage at Octavian Wine Vaults in Wiltshire, UK. The collection is fully insured and tracked via blockchain provenance certificates. Fine wine as an asset class has returned 10.6% annually over the past 30 years, with Pétrus consistently outperforming the broader Liv-ex index.",
    image:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80",
    location: "Octavian Vaults, UK",
    totalValue: 950_000,
    tokenSupply: 9_500,
    tokenPrice: 100,
    projectedYield: 10.6,
    liquidityScore: 6,
    minInvestment: 100,
    funded: 89,
    tags: ["fine-wine", "alternative", "collectible"],
    highlights: [
      "Château Pétrus 2009–2015 vertical (6 exceptional vintages)",
      "10.6% average annual return (Liv-ex data)",
      "Blockchain provenance certificates",
      "Bonded storage — tax deferred",
    ],
  },
  {
    id: "asset-005",
    name: "Munich Logistics Hub",
    category: "infrastructure",
    description:
      "Grade-A logistics facility near Munich Airport with Amazon as anchor tenant.",
    longDescription:
      "A 45,000 sqm Grade-A logistics and fulfillment center located 8 km from Munich International Airport. Amazon operates as anchor tenant under a 10-year triple-net lease. The facility features automated sorting systems, 50 truck docking bays, and solar roof panels. The logistics real estate sector has seen 22% cap rate compression over 5 years driven by e-commerce growth.",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
    location: "Munich, Germany",
    totalValue: 12_400_000,
    tokenSupply: 124_000,
    tokenPrice: 100,
    projectedYield: 5.9,
    liquidityScore: 9,
    minInvestment: 100,
    funded: 34,
    tags: ["logistics", "triple-net", "e-commerce"],
    highlights: [
      "Amazon anchor tenant — 10-year triple-net lease",
      "45,000 sqm Grade-A logistics facility",
      "5.9% net yield, paid monthly",
      "Adjacent to Munich Airport cargo hub",
    ],
  },
  {
    id: "asset-006",
    name: "Lisbon Tech Campus",
    category: "real-estate",
    description:
      "Modern mixed-use tech campus in Parque das Nações, Lisbon — fully leased to startups.",
    longDescription:
      "A contemporary 18,000 sqm mixed-use campus in Lisbon's thriving Parque das Nações district, fully occupied by a curated mix of tech startups, scale-ups, and co-working operators. The campus benefits from Lisbon's emergence as a top European tech hub, with tenant demand consistently exceeding supply. Weighted average lease expiry of 4.2 years with annual CPI-linked rent escalations.",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    location: "Lisbon, Portugal",
    totalValue: 3_600_000,
    tokenSupply: 36_000,
    tokenPrice: 100,
    projectedYield: 8.1,
    liquidityScore: 7,
    minInvestment: 100,
    funded: 62,
    tags: ["tech", "office", "growth-market"],
    highlights: [
      "100% occupancy — 22 tech tenants",
      "8.1% yield with CPI rent escalations",
      "Lisbon ranked #3 European tech hub (2024)",
      "NHR tax regime — favorable for investors",
    ],
  },
];
