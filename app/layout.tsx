import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const basePath = process.env.PAGES_BASE_PATH || "";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Federal Criminal Common Law Atlas",
  description:
    "Explore 896 Supreme Court cases, change over time, and the evolving afterlife of Hudson & Goodwin.",
  icons: {
    icon: `${basePath}/favicon.svg`,
    shortcut: `${basePath}/favicon.svg`,
  },
  openGraph: {
    title: "Federal Criminal Common Law Atlas",
    description: "896 Supreme Court cases, change over time, and the evolving afterlife of Hudson & Goodwin.",
    type: "website",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "Federal Criminal Common Law Atlas" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Federal Criminal Common Law Atlas",
    description: "896 Supreme Court cases · 1789–2026",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
