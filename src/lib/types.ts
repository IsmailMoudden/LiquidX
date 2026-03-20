export type AssetCategory = "real-estate" | "infrastructure" | "art" | "wine";

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  description: string;
  longDescription: string;
  image: string;
  location: string;
  totalValue: number;
  tokenSupply: number;
  tokenPrice: number;
  projectedYield: number;
  liquidityScore: number; // 1–10
  minInvestment: number;
  funded: number; // percentage 0–100
  tags: string[];
  highlights: string[];
}

export interface Holding {
  assetId: string;
  tokens: number;
  avgBuyPrice: number;
  purchasedAt: string;
}

export type TransactionType = "buy" | "sell" | "tokenize";

export interface Transaction {
  id: string;
  type: TransactionType;
  assetId: string;
  assetName: string;
  tokens: number;
  price: number;
  total: number;
  timestamp: string;
}

export interface PortfolioState {
  usdcBalance: number;
  holdings: Holding[];
  transactions: Transaction[];
  assets: Asset[]; // includes user-tokenized ones
}
