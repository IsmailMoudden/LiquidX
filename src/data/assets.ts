import { Asset } from "@/lib/types";

export const MOCK_ASSETS: Asset[] = [
  // ─── REAL ESTATE ────────────────────────────────────────────────────────────
  {
    id: "asset-001",
    name: "Geneva Residential Tower",
    category: "real-estate",
    description:
      "Prime residential tower in Geneva's financial district with 120 luxury apartments.",
    longDescription:
      "Located in the heart of Geneva's prestigious financial district, this 24-story residential tower offers 120 fully-furnished luxury apartments with panoramic views of Lake Geneva and the Alps. The asset is fully leased to high-net-worth individuals and corporate tenants, generating stable rental income.",
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
    tags: ["Residential", "Prime Location", "ESG"],
    highlights: [
      "120 luxury apartments, fully leased",
      "6.2% annual yield paid quarterly",
      "LEED Gold certified building",
      "Managed by Helvetica Asset Management",
    ],
  },
  {
    id: "asset-006",
    name: "Lisbon Tech Campus",
    category: "real-estate",
    description:
      "Modern mixed-use tech campus in Parque das Nações, Lisbon — fully leased to startups.",
    longDescription:
      "A contemporary 18,000 sqm mixed-use campus in Lisbon's thriving Parque das Nações district, fully occupied by a curated mix of tech startups, scale-ups, and co-working operators.",
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
    tags: ["Tech", "Office", "Growth Market"],
    highlights: [
      "100% occupancy — 22 tech tenants",
      "8.1% yield with CPI rent escalations",
      "Lisbon ranked #3 European tech hub (2024)",
      "NHR tax regime — favorable for investors",
    ],
  },
  {
    id: "asset-010",
    name: "Dubai Marina Penthouse Collection",
    category: "real-estate",
    description:
      "Portfolio of 8 ultra-luxury penthouses across Dubai Marina with short-term rental income.",
    longDescription:
      "Eight fully-furnished penthouses across four towers in Dubai Marina, managed by a leading luxury short-term rental operator. Average occupancy of 78%, generating premium nightly rates from high-net-worth visitors.",
    image:
      "https://images.unsplash.com/photo-1582407947304-fd86f28f9a96?w=800&q=80",
    location: "Dubai Marina, UAE",
    totalValue: 6_200_000,
    tokenSupply: 62_000,
    tokenPrice: 100,
    projectedYield: 9.4,
    liquidityScore: 8,
    minInvestment: 100,
    funded: 47,
    tags: ["Luxury", "Short-Term Rental", "Tourism"],
    highlights: [
      "78% average occupancy year-round",
      "9.4% net yield from premium STR rates",
      "0% property tax jurisdiction",
      "Managed by Luxe Stay Dubai",
    ],
  },
  {
    id: "asset-011",
    name: "Paris 8th — Haussmann Office",
    category: "real-estate",
    description:
      "Classic Haussmann-era office building on Avenue Friedland, fully let to a CAC 40 firm.",
    longDescription:
      "A 3,200 sqm Haussmann-era office building on one of Paris's most prestigious addresses. Single tenant: a CAC 40 financial services firm on a 9-year commercial lease with fixed annual escalation of 2.5%.",
    image:
      "https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&q=80",
    location: "Paris 8th, France",
    totalValue: 11_800_000,
    tokenSupply: 118_000,
    tokenPrice: 100,
    projectedYield: 4.8,
    liquidityScore: 9,
    minInvestment: 100,
    funded: 88,
    tags: ["Core Asset", "Single Tenant", "Trophy"],
    highlights: [
      "CAC 40 tenant — 9-year lease",
      "4.8% net yield + 2.5% rent escalation",
      "Grade A Haussmann heritage building",
      "Zero vacancy risk for 9 years",
    ],
  },

  // ─── INFRASTRUCTURE ─────────────────────────────────────────────────────────
  {
    id: "asset-002",
    name: "Solar Farm Alpha — Occitanie",
    category: "infrastructure",
    description:
      "100 MW solar farm in southern France with 20-year PPA agreements.",
    longDescription:
      "A utility-scale 100 MW photovoltaic solar installation spanning 200 hectares in the Occitanie region of southern France. The project operates under 20-year Power Purchase Agreements (PPA) with EDF.",
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
    tags: ["Green Energy", "PPA", "Infrastructure"],
    highlights: [
      "20-year PPA with EDF (investment grade)",
      "7.8% IRR with carbon credit upside",
      "180 GWh annual production capacity",
      "Fully operational since 2022",
    ],
  },
  {
    id: "asset-005",
    name: "Munich Logistics Hub",
    category: "infrastructure",
    description:
      "Grade-A logistics facility near Munich Airport with Amazon as anchor tenant.",
    longDescription:
      "A 45,000 sqm Grade-A logistics and fulfillment center located 8 km from Munich International Airport. Amazon operates as anchor tenant under a 10-year triple-net lease.",
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
    tags: ["Logistics", "Triple-Net", "E-Commerce"],
    highlights: [
      "Amazon anchor tenant — 10-year triple-net lease",
      "45,000 sqm Grade-A logistics facility",
      "5.9% net yield, paid monthly",
      "Adjacent to Munich Airport cargo hub",
    ],
  },
  {
    id: "asset-012",
    name: "Scottish Wind Portfolio",
    category: "infrastructure",
    description:
      "Portfolio of 3 onshore wind farms across the Scottish Highlands, 68 MW total capacity.",
    longDescription:
      "Three fully-operational onshore wind farms in the Scottish Highlands with a combined capacity of 68 MW. All projects operate under 15-year government Contracts for Difference (CfD), providing index-linked, highly predictable revenue streams.",
    image:
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&q=80",
    location: "Scottish Highlands, UK",
    totalValue: 4_800_000,
    tokenSupply: 48_000,
    tokenPrice: 100,
    projectedYield: 8.3,
    liquidityScore: 7,
    minInvestment: 100,
    funded: 71,
    tags: ["Wind Energy", "CfD", "Index-Linked"],
    highlights: [
      "15-year CfD contracts — government-backed",
      "8.3% levered IRR",
      "68 MW powering ~40,000 homes",
      "Carbon offset certificates included",
    ],
  },

  // ─── COLLECTIBLES ───────────────────────────────────────────────────────────
  {
    id: "asset-007",
    name: "Patek Philippe Vault — 12 Pieces",
    category: "collectibles",
    description:
      "Curated vault of 12 rare Patek Philippe references including a Ref. 5711 and Nautilus variants.",
    longDescription:
      "A professionally curated collection of 12 Patek Philippe timepieces, including a Ref. 5711/1A-010 (discontinued), two Nautilus variants, and a Perpetual Calendar Ref. 5140. All watches are unworn, complete with box and papers, stored in a climate-controlled vault at a Geneva free port. The watch market has returned 15–20% annually since 2019.",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80",
    location: "Geneva Freeport, Switzerland",
    totalValue: 2_400_000,
    tokenSupply: 24_000,
    tokenPrice: 100,
    projectedYield: 14.5,
    liquidityScore: 6,
    minInvestment: 100,
    funded: 55,
    tags: ["Watches", "Patek Philippe", "Hard Asset"],
    highlights: [
      "12 unworn pieces — box & papers",
      "Includes discontinued Ref. 5711/1A-010",
      "14.5% CAGR (WatchCharts data, 5yr)",
      "Fully insured at agreed value",
    ],
  },
  {
    id: "asset-008",
    name: "Rolex Sport Reference Collection",
    category: "collectibles",
    description:
      "18 Rolex sport references including vintage Daytona, Submariner, and GMT-Master II.",
    longDescription:
      "A collection of 18 Rolex sport watches spanning five decades, with a focus on vintage Paul Newman Daytonas, Submariner Kermit and Batman references, and modern GMT-Master II 'Pepsi' and 'Batman' variations. Sourced from private collectors and verified by Rolex-certified watchmakers.",
    image:
      "https://images.unsplash.com/photo-1548169874-53e85f753f1e?w=800&q=80",
    location: "Zurich, Switzerland",
    totalValue: 1_650_000,
    tokenSupply: 16_500,
    tokenPrice: 100,
    projectedYield: 11.8,
    liquidityScore: 7,
    minInvestment: 100,
    funded: 39,
    tags: ["Rolex", "Vintage", "Collectibles"],
    highlights: [
      "18 verified Rolex sport references",
      "Includes rare Paul Newman Daytona",
      "11.8% CAGR over 5 years",
      "Liquid secondary market via Chrono24/Phillips",
    ],
  },
  {
    id: "asset-013",
    name: "Classic Car Portfolio — Le Mans Icons",
    category: "collectibles",
    description:
      "5 racing-pedigree classics: Ferrari 250 GTO replica, Porsche 908, and 3 Jaguar E-Types.",
    longDescription:
      "A curated portfolio of five classic motorsport cars stored at a specialist classic car facility in Monaco. Includes an authenticated Porsche 908/01, three matching-numbers Jaguar E-Type Series 1s, and a Ferrari 250 GT replica with full provenance. Professionally maintained and available for concours display.",
    image:
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80",
    location: "Monaco",
    totalValue: 3_100_000,
    tokenSupply: 31_000,
    tokenPrice: 100,
    projectedYield: 9.2,
    liquidityScore: 5,
    minInvestment: 100,
    funded: 28,
    tags: ["Classic Cars", "Motorsport", "Concours"],
    highlights: [
      "Authenticated Porsche 908/01 — race history",
      "9.2% average annual appreciation (HAGI index)",
      "Monaco storage + specialist maintenance",
      "Concours display income included",
    ],
  },
  {
    id: "asset-022",
    name: "Singapore Orchard Road Retail",
    category: "real-estate",
    description:
      "Premium retail unit on Orchard Road — Singapore's luxury shopping corridor, fully tenanted.",
    longDescription:
      "A 1,800 sqm premium retail unit on Orchard Road, Singapore's most prestigious shopping boulevard. The property is fully tenanted by an international luxury brand under a 7-year triple-net lease with built-in 3% annual escalation. Singapore's retail real estate benefits from zero capital gains tax and one of Asia's strongest consumer spending environments.",
    image:
      "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&q=80",
    location: "Orchard Road, Singapore",
    totalValue: 9_100_000,
    tokenSupply: 91_000,
    tokenPrice: 100,
    projectedYield: 5.6,
    liquidityScore: 9,
    minInvestment: 100,
    funded: 61,
    tags: ["Retail", "Triple-Net", "Asia Pacific"],
    highlights: [
      "Luxury brand tenant — 7-year triple-net lease",
      "3% fixed annual rent escalation",
      "0% capital gains tax — Singapore",
      "Orchard Road — Asia's top retail destination",
    ],
  },
  {
    id: "asset-023",
    name: "Manhattan Micro-Apartment Portfolio",
    category: "real-estate",
    description:
      "32 micro-units in Midtown Manhattan operated as furnished corporate rentals.",
    longDescription:
      "A portfolio of 32 purpose-built micro-apartments (25–40 sqm) across two Midtown Manhattan buildings, fully operated as furnished corporate rentals by a specialist operator. Average occupancy of 92% driven by demand from financial sector and tech relocators. Monthly rents average $4,200 per unit.",
    image:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80",
    location: "Midtown Manhattan, USA",
    totalValue: 7_400_000,
    tokenSupply: 74_000,
    tokenPrice: 100,
    projectedYield: 7.3,
    liquidityScore: 8,
    minInvestment: 100,
    funded: 53,
    tags: ["Corporate Rental", "High Occupancy", "NYC"],
    highlights: [
      "92% average occupancy — corporate tenants",
      "7.3% net yield, distributed monthly",
      "$4,200 avg monthly rent per unit",
      "Midtown — walking distance to financial district",
    ],
  },
  {
    id: "asset-024",
    name: "Barcelona Gothic Quarter Hotel",
    category: "real-estate",
    description:
      "Boutique 48-room hotel in Barcelona's Gothic Quarter — fully operational with Michelin bistro.",
    longDescription:
      "A fully operational 48-room boutique hotel occupying a restored 16th-century building in Barcelona's Gothic Quarter. The property includes a Michelin-recommended bistro and rooftop terrace. RevPAR of €210 with 84% annual occupancy. Managed by a leading independent hotel management company.",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    location: "Barcelona, Spain",
    totalValue: 5_800_000,
    tokenSupply: 58_000,
    tokenPrice: 100,
    projectedYield: 8.7,
    liquidityScore: 7,
    minInvestment: 100,
    funded: 44,
    tags: ["Hospitality", "Boutique Hotel", "Tourism"],
    highlights: [
      "84% annual occupancy — €210 RevPAR",
      "8.7% yield including F&B revenue",
      "Michelin-recommended bistro on-site",
      "UNESCO World Heritage surroundings",
    ],
  },
  {
    id: "asset-025",
    name: "Tokyo Shibuya Mixed-Use Tower",
    category: "real-estate",
    description:
      "15-floor mixed-use tower in Shibuya — retail podium + residential floors, 98% occupied.",
    longDescription:
      "A 15-floor mixed-use tower in Tokyo's Shibuya ward, combining a retail podium (floors 1–3) with 72 residential apartments (floors 4–15). The asset is 98% occupied and benefits from Japan's stable long-term leasing culture. Tokyo Grade-A assets have seen consistent 4–6% annual capital appreciation.",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    location: "Shibuya, Tokyo, Japan",
    totalValue: 14_200_000,
    tokenSupply: 142_000,
    tokenPrice: 100,
    projectedYield: 5.1,
    liquidityScore: 9,
    minInvestment: 100,
    funded: 79,
    tags: ["Mixed-Use", "Tokyo", "Core Asset"],
    highlights: [
      "98% occupancy — retail + residential",
      "5.1% yield + 4–6% annual capital growth",
      "Shibuya — Tokyo's prime commercial hub",
      "Earthquake-resistant — post-2000 construction",
    ],
  },
  {
    id: "asset-026",
    name: "Amsterdam Canal House Collection",
    category: "real-estate",
    description:
      "4 restored 17th-century canal houses converted to premium short-stay apartments.",
    longDescription:
      "Four fully restored 17th-century Dutch Golden Age canal houses on Herengracht and Keizersgracht, converted to 22 premium short-stay apartments. Managed under Amsterdam's regulated short-stay licence with average nightly rates of €380 and 76% annual occupancy.",
    image:
      "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80",
    location: "Amsterdam, Netherlands",
    totalValue: 4_300_000,
    tokenSupply: 43_000,
    tokenPrice: 100,
    projectedYield: 7.9,
    liquidityScore: 7,
    minInvestment: 100,
    funded: 68,
    tags: ["Heritage", "Short-Stay", "Canal Belt"],
    highlights: [
      "UNESCO World Heritage Canal Belt location",
      "7.9% yield — €380 avg nightly rate",
      "76% annual occupancy across 22 units",
      "Fully licensed short-stay operation",
    ],
  },
  {
    id: "asset-015",
    name: "Pokémon PSA 10 Master Set",
    category: "collectibles",
    description:
      "Complete PSA 10 Base Set Shadowless including 1st Edition Charizard — sealed storage.",
    longDescription:
      "A complete PSA Gem Mint 10 graded Base Set Shadowless collection with 102 cards, anchored by a 1st Edition Charizard valued independently at $450K. Stored in a temperature-controlled safety deposit facility in Singapore. TCG collectibles have been the fastest-appreciating alternative asset class 2020–2024.",
    image:
      "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=800&q=80",
    location: "Singapore",
    totalValue: 920_000,
    tokenSupply: 9_200,
    tokenPrice: 100,
    projectedYield: 22.1,
    liquidityScore: 7,
    minInvestment: 100,
    funded: 67,
    tags: ["Trading Cards", "PSA 10", "Pokémon"],
    highlights: [
      "1st Edition Charizard PSA 10 — $450K anchor",
      "22.1% CAGR since 2020 (PWCC index)",
      "Complete 102-card set, all PSA Gem Mint 10",
      "Singapore vault — optimal climate control",
    ],
  },

  // ─── ART ────────────────────────────────────────────────────────────────────
  {
    id: "asset-003",
    name: "Basquiat — Untitled No. 7",
    category: "art",
    description:
      "Authenticated Jean-Michel Basquiat canvas from the 1983 New York series.",
    longDescription:
      "A 1983 mixed-media canvas by Jean-Michel Basquiat, authenticated by the Authentication Committee and held in climate-controlled storage at the Geneva Freeport.",
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
    tags: ["Blue-Chip Art", "Post-War", "Appreciation"],
    highlights: [
      "Authenticated by Basquiat Authentication Committee",
      "12.4% CAGR (art market comparable)",
      "Stored at Geneva Freeport (tax advantaged)",
      "Fully insured at Lloyds of London",
    ],
  },
  {
    id: "asset-016",
    name: "Banksy — Original Canvas Triptych",
    category: "art",
    description:
      "Three original Banksy oil canvases from the 2002 Existencilism show, with full provenance.",
    longDescription:
      "A triptych of original Banksy oil-on-canvas works authenticated by Pest Control and exhibited at the 2002 Existencilism show. The works were acquired directly from the original collector and have been professionally conserved. Banksy's market has shown resilience with auction records set annually.",
    image:
      "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&q=80",
    location: "London Freeport, UK",
    totalValue: 2_200_000,
    tokenSupply: 22_000,
    tokenPrice: 100,
    projectedYield: 15.8,
    liquidityScore: 6,
    minInvestment: 100,
    funded: 33,
    tags: ["Street Art", "Banksy", "Pest Control"],
    highlights: [
      "Pest Control authenticated — official certificate",
      "15.8% avg appreciation (Artnet data)",
      "Exhibition history at Existencilism 2002",
      "Insured for full replacement value",
    ],
  },

  // ─── WINE & SPIRITS ─────────────────────────────────────────────────────────
  {
    id: "asset-004",
    name: "Bordeaux Grand Cru Reserve",
    category: "wine",
    description:
      "Château Pétrus 2009–2015 vertical — 600 bottles in bonded storage.",
    longDescription:
      "A curated collection of 600 bottles from Château Pétrus spanning the exceptional 2009–2015 vintages, held in bonded storage at Octavian Wine Vaults in Wiltshire, UK.",
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
    tags: ["Fine Wine", "Pétrus", "Bonded Storage"],
    highlights: [
      "Château Pétrus 2009–2015 vertical",
      "10.6% average annual return (Liv-ex data)",
      "Blockchain provenance certificates",
      "Bonded storage — tax deferred",
    ],
  },
  {
    id: "asset-017",
    name: "Rare Whisky Cask Portfolio",
    category: "wine",
    description:
      "8 single-malt Scotch casks from Macallan, Springbank & Ardbeg distilleries, 2004–2012.",
    longDescription:
      "Eight maturing Scotch whisky casks across three iconic distilleries: Macallan (x3, 2007–2010), Springbank (x3, 2004–2008), and Ardbeg (x2, 2012). All casks are bonded at John Distell Group warehouses in Speyside and Campbeltown. The rare whisky cask market has returned 16.4% CAGR over the past decade (Rare Whisky 101 Apex index).",
    image:
      "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&q=80",
    location: "Speyside, Scotland",
    totalValue: 1_200_000,
    tokenSupply: 12_000,
    tokenPrice: 100,
    projectedYield: 16.4,
    liquidityScore: 6,
    minInvestment: 100,
    funded: 54,
    tags: ["Whisky Casks", "Speyside", "Maturing"],
    highlights: [
      "Macallan, Springbank & Ardbeg — 8 casks",
      "16.4% CAGR (RW101 Apex index)",
      "Bonded warehouse — no duty until bottling",
      "Increasing value as whisky matures",
    ],
  },

  // ─── PRIVATE EQUITY ─────────────────────────────────────────────────────────
  {
    id: "asset-018",
    name: "Series B — ClimateTech Syndicate",
    category: "private-equity",
    description:
      "Co-investment in a €40M Series B round for a European carbon capture startup.",
    longDescription:
      "Participate alongside a top-tier European VC in the Series B round of a Berlin-based carbon capture technology company that has demonstrated 40% cost reduction in direct air capture over 18 months. The company holds patents in 12 countries and has signed LOIs with 3 major industrial emitters.",
    image:
      "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&q=80",
    location: "Berlin, Germany",
    totalValue: 2_000_000,
    tokenSupply: 20_000,
    tokenPrice: 100,
    projectedYield: 24.0,
    liquidityScore: 3,
    minInvestment: 100,
    funded: 19,
    tags: ["ClimateTech", "Series B", "VC-Backed"],
    highlights: [
      "40% DAC cost reduction proven at pilot scale",
      "24% target IRR (5-year horizon)",
      "Co-invest alongside Earlybird Ventures",
      "LOIs with 3 Fortune 500 industrial emitters",
    ],
  },
  {
    id: "asset-019",
    name: "Pre-IPO — AI Infrastructure Co.",
    category: "private-equity",
    description:
      "Secondary share purchase in a $2B+ valued AI compute infrastructure company.",
    longDescription:
      "Secondary market shares in a US-based AI infrastructure company providing GPU-as-a-service to enterprise clients. The company operates 12,000+ H100 GPUs across three US data centers and is targeting a Nasdaq IPO in H2 2025 at a projected $4B valuation.",
    image:
      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
    location: "San Francisco, USA",
    totalValue: 3_500_000,
    tokenSupply: 35_000,
    tokenPrice: 100,
    projectedYield: 31.5,
    liquidityScore: 4,
    minInvestment: 100,
    funded: 44,
    tags: ["Pre-IPO", "AI", "Tech"],
    highlights: [
      "Current valuation: $2.1B — targeting $4B at IPO",
      "31.5% projected return to IPO (18-month)",
      "12,000+ H100 GPUs under management",
      "Q3 2025 IPO target on Nasdaq",
    ],
  },

  // ─── COMMODITIES ────────────────────────────────────────────────────────────
  {
    id: "asset-020",
    name: "London Gold Vault — 500 kg",
    category: "commodities",
    description:
      "500 kg of LBMA-certified gold bars held in secure vault at Brinks London.",
    longDescription:
      "Physical LBMA Good Delivery gold bars (500 kg total, 16 bars) held in the Brinks London vault under a specialist commodity custodian. Each bar is individually numbered and tracked. Gold provides portfolio diversification and inflation hedge, with zero counterparty risk.",
    image:
      "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80",
    location: "London, UK",
    totalValue: 29_500_000,
    tokenSupply: 295_000,
    tokenPrice: 100,
    projectedYield: 6.5,
    liquidityScore: 10,
    minInvestment: 100,
    funded: 82,
    tags: ["Gold", "LBMA", "Hard Asset"],
    highlights: [
      "LBMA Good Delivery standard — 99.5% purity",
      "6.5% avg annual return (10-year)",
      "Zero counterparty risk — physical backing",
      "T+2 settlement liquidity via LBMA",
    ],
  },
  {
    id: "asset-021",
    name: "Colombian Emerald Reserve",
    category: "commodities",
    description:
      "GIA-certified collection of 47 investment-grade Colombian emeralds, 5–18 carats each.",
    longDescription:
      "A collection of 47 GIA-certified natural Colombian emeralds ranging from 5 to 18 carats, sourced from the Muzo and Chivor mines. All stones have minor to no oil treatment, are accompanied by individual GIA reports, and are stored in a Geneva free port. Investment-grade emeralds have outperformed diamonds over the past decade.",
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80",
    location: "Geneva Freeport, Switzerland",
    totalValue: 1_450_000,
    tokenSupply: 14_500,
    tokenPrice: 100,
    projectedYield: 13.7,
    liquidityScore: 5,
    minInvestment: 100,
    funded: 36,
    tags: ["Gemstones", "GIA Certified", "Rare"],
    highlights: [
      "47 GIA-certified natural Colombian emeralds",
      "13.7% CAGR (Gemval index, 10-year)",
      "Muzo & Chivor origin — premium provenance",
      "No treatment / minor oil — maximum grade",
    ],
  },
];
