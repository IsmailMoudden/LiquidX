import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { TonProvider } from "@/components/providers/TonProvider";
import { DeadlineWatcher } from "@/components/providers/DeadlineWatcher";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "LiquidX — Fractional Real-World Assets",
  description:
    "Invest in premium real-world assets using stablecoins. Instant liquidity. Institutional grade.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background">
        <AuthProvider>
          <TonProvider>
            <DeadlineWatcher />
            <Navbar />
            <main>{children}</main>
          </TonProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
