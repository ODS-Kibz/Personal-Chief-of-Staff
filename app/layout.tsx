import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chief of Staff",
  description: "Build 1 — Continuity Core"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
