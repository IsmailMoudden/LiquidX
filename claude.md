## LiquidX — Project Context & Pivot (March 2026)

### Project Overview
LiquidX is a modern web application for tokenizing, buying, and selling fractional ownership of real-world assets (RWAs) using stablecoins (USDC). The platform provides instant liquidity, institutional-grade vetting, and a seamless user experience for both retail and professional investors. It is built with Next.js 15 (App Router), React 19, Zustand for state management, and TailwindCSS for UI, with integrations for TON wallet authentication and XRPL testnet settlement.

### Core Features
- **Marketplace:** Browse, search, and filter a curated set of tokenized assets (real estate, infrastructure, art, wine, collectibles, private equity, commodities).
- **Portfolio:** Track your USDC balance, holdings, asset allocation, and transaction history in real time.
- **Tokenization:** Users can list new assets for fractional investment, specifying category, valuation, supply, yield, and liquidity.
- **Trading:** Buy and sell asset tokens instantly, with all transactions settled in USDC. Purchases are authenticated via TON wallet and settled (simulated or real) on XRPL testnet.
- **Transparency:** Full dashboard with allocation charts, funding progress, and detailed asset information.
- **UX:** Responsive, minimal, and professional design with modular components and animated UI elements.

### Technical Architecture
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, TailwindCSS, Framer Motion, Lucide icons.
- **State Management:** Zustand (with persistence for portfolio state).
- **Blockchain Integration:**
	- **TON Wallet:** User authentication and authorization for trades.
	- **XRPL Testnet:** Payment settlement for asset purchases (with fallback to simulation).
- **Data:** Asset data is mocked in the codebase for demo purposes; all portfolio and transaction state is managed client-side.
- **UI Components:** Custom UI for asset cards, trade dialogs, charts (Recharts), and interactive tables.

### Main Components & Files
- `src/app/page.tsx` — Landing page, feature overview, and call-to-action.
- `src/app/marketplace/page.tsx` — Asset marketplace with search, filter, sort, and grid/list views.
- `src/app/portfolio/page.tsx` — Portfolio dashboard: stats, allocation chart, holdings, and transactions.
- `src/app/tokenize/page.tsx` — Asset tokenization form for listing new RWAs.
- `src/app/assets/[id]/page.tsx` — Asset detail page with trading panel and highlights.
- `src/store/portfolio-store.ts` — Zustand store for all portfolio, holdings, and transaction logic.
- `src/data/assets.ts` — Mock asset data (various categories, yields, and locations).
- `src/lib/types.ts` — TypeScript types for assets, holdings, transactions, and categories.
- `src/lib/xrpl.ts` — XRPL testnet integration and payment simulation logic.
- `src/components/assets/TradeDialog.tsx` — Modal for buying/selling tokens, wallet gating, and XRPL settlement.
- `src/components/layout/Navbar.tsx` — Main navigation bar with wallet and balance display.

### The Pivot (March 2026)
**Pivot Context:**
LiquidX is shifting from a pure demo/prototype to a more robust, production-ready platform. The pivot focuses on:
- **Real Asset Onboarding:** Moving from mock/demo assets to onboarding real, legally-structured assets with verified documentation and compliance.
- **Backend/API Layer:** Introducing a backend for asset management, user accounts, and transaction history persistence (beyond client-side state).
- **Multi-chain Support:** Expanding settlement options beyond XRPL to include other blockchains (e.g., Ethereum, Polygon) and supporting more wallet types.
- **Regulatory Compliance:** Implementing KYC/AML flows, legal wrappers, and jurisdictional controls for global investor access.
- **Yield Automation:** Automating yield distribution and reporting, with on-chain and off-chain data feeds.
- **Scalability:** Refactoring for modularity, testability, and future integrations (e.g., real-time pricing, secondary market, asset ratings).

### Usage & Development
- **Local Dev:** `npm install` then `npm run dev` (Next.js dev server)
- **Demo:** All data is mock/demo; no real assets or transactions are live yet.
- **Wallets:** TON wallet required for trade actions; XRPL testnet used for payment simulation.

---
**Summary:**
LiquidX is a next-generation platform for democratizing access to real-world asset investing, blending DeFi principles with institutional rigor. The current pivot aims to transition from a polished prototype to a compliant, scalable, and production-grade RWA marketplace.
