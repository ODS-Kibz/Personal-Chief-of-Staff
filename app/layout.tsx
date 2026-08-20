import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";
import "./enhancements.css";
import "./operations.css";

export const metadata: Metadata = {
  title: "Chief of Staff",
  description: "Build 1 — Continuity Core"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
