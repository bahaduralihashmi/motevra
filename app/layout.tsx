import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://motevra.com"),
  title: {
    default: "MOTEVRA | Automotive Marketplace",
    template: "%s | MOTEVRA",
  },
  description: "MOTEVRA is a modern automotive marketplace for tyres, wheels, auto parts, accessories and car care.",
  applicationName: "MOTEVRA",
  keywords: ["MOTEVRA", "tyres", "tires", "wheels", "auto parts", "car accessories", "automotive marketplace"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "MOTEVRA | Automotive Marketplace",
    description: "Everything your drive needs.",
    url: "https://motevra.com",
    siteName: "MOTEVRA",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
