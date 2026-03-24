import type { Metadata } from "next";
import { Lora, Noto_Naskh_Arabic } from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { defaultMetadata } from "@/lib/metadata";

import "./globals.css";

const arabicFont = Noto_Naskh_Arabic({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  display: "swap"
});

const latinFont = Lora({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap"
});

export const metadata: Metadata = defaultMetadata;

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${arabicFont.variable} ${latinFont.variable} text-ink antialiased`}>
        <Header />
        <main className="container-page py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
