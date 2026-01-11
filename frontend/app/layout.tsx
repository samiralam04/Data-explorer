import type { Metadata } from "next";
import React from 'react';
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import HistoryTracker from "@/components/HistoryTracker";
import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Product Data Explorer",
  description: "Scrape and explore product data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${plusJakarta.variable} antialiased font-sans bg-zinc-50 dark:bg-black text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30`}
      >
        <Providers>
          <React.Suspense fallback={null}>
            <HistoryTracker />
          </React.Suspense>
          <Navbar />
          <div className="pt-0">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
