import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Asset, Holding, PortfolioState, Transaction } from "@/lib/types";
import { MOCK_ASSETS } from "@/data/assets";
import { generateId } from "@/lib/utils";

interface PortfolioActions {
  buyAsset: (assetId: string, tokenAmount: number) => { success: boolean; error?: string };
  sellAsset: (assetId: string, tokenAmount: number) => { success: boolean; error?: string };
  tokenizeAsset: (asset: Omit<Asset, "id" | "funded">) => Asset;
  resetPortfolio: () => void;
}

const INITIAL_STATE: PortfolioState = {
  usdcBalance: 50_000,
  holdings: [
    {
      assetId: "asset-001",
      tokens: 15,
      avgBuyPrice: 100,
      purchasedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      assetId: "asset-002",
      tokens: 8,
      avgBuyPrice: 100,
      purchasedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      assetId: "asset-004",
      tokens: 5,
      avgBuyPrice: 100,
      purchasedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  transactions: [
    {
      id: "tx-001",
      type: "buy",
      assetId: "asset-001",
      assetName: "Geneva Residential Tower",
      tokens: 15,
      price: 100,
      total: 1500,
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "tx-002",
      type: "buy",
      assetId: "asset-002",
      assetName: "Solar Farm Alpha",
      tokens: 8,
      price: 100,
      total: 800,
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "tx-003",
      type: "buy",
      assetId: "asset-004",
      assetName: "Bordeaux Grand Cru Reserve",
      tokens: 5,
      price: 100,
      total: 500,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  assets: MOCK_ASSETS,
};

export const usePortfolioStore = create<PortfolioState & PortfolioActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      buyAsset: (assetId, tokenAmount) => {
        const state = get();
        const asset = state.assets.find((a) => a.id === assetId);
        if (!asset) return { success: false, error: "Asset not found" };

        const totalCost = tokenAmount * asset.tokenPrice;
        if (totalCost > state.usdcBalance) {
          return { success: false, error: "Insufficient USDC balance" };
        }
        if (tokenAmount <= 0) {
          return { success: false, error: "Invalid token amount" };
        }

        const existingHolding = state.holdings.find((h) => h.assetId === assetId);
        let updatedHoldings: Holding[];

        if (existingHolding) {
          const totalTokens = existingHolding.tokens + tokenAmount;
          const newAvgPrice =
            (existingHolding.tokens * existingHolding.avgBuyPrice +
              tokenAmount * asset.tokenPrice) /
            totalTokens;
          updatedHoldings = state.holdings.map((h) =>
            h.assetId === assetId
              ? { ...h, tokens: totalTokens, avgBuyPrice: newAvgPrice }
              : h
          );
        } else {
          updatedHoldings = [
            ...state.holdings,
            {
              assetId,
              tokens: tokenAmount,
              avgBuyPrice: asset.tokenPrice,
              purchasedAt: new Date().toISOString(),
            },
          ];
        }

        const newTransaction: Transaction = {
          id: `tx-${generateId()}`,
          type: "buy",
          assetId,
          assetName: asset.name,
          tokens: tokenAmount,
          price: asset.tokenPrice,
          total: totalCost,
          timestamp: new Date().toISOString(),
        };

        set({
          usdcBalance: state.usdcBalance - totalCost,
          holdings: updatedHoldings,
          transactions: [newTransaction, ...state.transactions],
        });

        return { success: true };
      },

      sellAsset: (assetId, tokenAmount) => {
        const state = get();
        const asset = state.assets.find((a) => a.id === assetId);
        if (!asset) return { success: false, error: "Asset not found" };

        const holding = state.holdings.find((h) => h.assetId === assetId);
        if (!holding || holding.tokens < tokenAmount) {
          return { success: false, error: "Insufficient tokens" };
        }
        if (tokenAmount <= 0) {
          return { success: false, error: "Invalid token amount" };
        }

        const saleProceeds = tokenAmount * asset.tokenPrice;
        let updatedHoldings: Holding[];

        if (holding.tokens === tokenAmount) {
          updatedHoldings = state.holdings.filter((h) => h.assetId !== assetId);
        } else {
          updatedHoldings = state.holdings.map((h) =>
            h.assetId === assetId ? { ...h, tokens: h.tokens - tokenAmount } : h
          );
        }

        const newTransaction: Transaction = {
          id: `tx-${generateId()}`,
          type: "sell",
          assetId,
          assetName: asset.name,
          tokens: tokenAmount,
          price: asset.tokenPrice,
          total: saleProceeds,
          timestamp: new Date().toISOString(),
        };

        set({
          usdcBalance: state.usdcBalance + saleProceeds,
          holdings: updatedHoldings,
          transactions: [newTransaction, ...state.transactions],
        });

        return { success: true };
      },

      tokenizeAsset: (assetData) => {
        const state = get();
        const newAsset: Asset = {
          ...assetData,
          id: `asset-${generateId()}`,
          funded: 0,
        };
        set({ assets: [...state.assets, newAsset] });
        return newAsset;
      },

      resetPortfolio: () => set(INITIAL_STATE),
    }),
    {
      name: "liquidx-portfolio",
    }
  )
);
