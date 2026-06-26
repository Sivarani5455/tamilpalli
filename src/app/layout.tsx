import "./globals.css";

import type { Metadata } from "next";
import { Noto_Sans_Tamil, Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans-modern",
  display: "swap",
});

const notoSansTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-tamil-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tamil Learning Platform",
  description: "Commercial Tamil learning platform built with Next.js and Supabase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} ${notoSansTamil.variable}`}>{children}</body>
    </html>
  );
}
