import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.motevra.com"),
  title: {
    default: "MOTEVRA | Tyres, Wheels & Auto Parts",
    template: "%s | MOTEVRA",
  },
  description: "Shop tyres, wheels, auto parts, batteries, accessories and car care at MOTEVRA — a modern automotive marketplace built for drivers in Pakistan and future international markets.",
  applicationName: "MOTEVRA",
  keywords: ["MOTEVRA", "tyres", "tires", "wheels", "auto parts", "car accessories", "automotive marketplace"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "MOTEVRA | Tyres, Wheels & Auto Parts",
    description: "Everything your drive needs.",
    url: "https://www.motevra.com",
    siteName: "MOTEVRA",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body>{process.env.NEXT_PUBLIC_ADSENSE_CLIENT ? <Script async src={"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client="+process.env.NEXT_PUBLIC_ADSENSE_CLIENT} crossOrigin="anonymous" strategy="afterInteractive" /> : null}{children}</body>
    </html>
  );
}
