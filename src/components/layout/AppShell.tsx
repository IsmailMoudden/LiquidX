"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDeck = pathname === "/deck";

  if (isDeck) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
